#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{linera_base_types::WithServiceAbi, views::View, Service, ServiceRuntime};
use deadkeys::{Operation, models::Zombie};
use linera_sdk::linera_base_types::ChainId;
use self::state::DeadKeysState;

pub struct DeadKeysService {
    state: Arc<DeadKeysState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(DeadKeysService);

impl WithServiceAbi for DeadKeysService {
    type Abi = deadkeys::DeadKeysAbi;
}

impl Service for DeadKeysService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let loaded_state = DeadKeysState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        let state = Arc::new(loaded_state);
        DeadKeysService {
            state: state.clone(),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot { state: self.state.clone() },
            MutationRoot { runtime: self.runtime.clone() },
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<DeadKeysService>>,
}

#[Object]
impl MutationRoot {
    /// Schedule a per-game score update operation
    #[graphql(name = "updateScore")]
    async fn update_score(
        &self,
        #[graphql(name = "gameId")] game_id: String,
        value: u64,
    ) -> bool {
        let op = Operation::UpdateScore { game_id, value };
        self.runtime.schedule_operation(&op);
        true
    }

    /// Schedule a cross-chain message send operation
    #[graphql(name = "sendMessage")]
    async fn send_message(
        &self,
        #[graphql(name = "targetChain")] target_chain: String,
        word: String,
        #[graphql(name = "msgType")] msg_type: String,
    ) -> String {
        // Parse the target chain ID
        let chain_id: ChainId = target_chain.parse().expect("Invalid ChainId");
        // Schedule the send operation
        let op = Operation::Send { target_chain: chain_id, word: word.clone(), msg_type: msg_type.clone() };
        self.runtime.schedule_operation(&op);
        // Echo back the message word
        word
    }
}

struct QueryRoot {
    state: Arc<DeadKeysState>,
}

#[Object]
impl QueryRoot {
    /// Retrieve the current score for a given game ID
    #[graphql(name = "score")]
    async fn score(
        &self,
        #[graphql(name = "gameId")] game_id: String,
    ) -> u64 {
        self.state
            .scores
            .get(&game_id)
            .await
            .unwrap_or_default()
            .unwrap_or_default()
    }

    /// Retrieve the last global message
    #[graphql(name = "zombie")]
    async fn last_message(&self) -> Option<Zombie> {
        match self.state.last_message.get(&"global".to_string()).await {
            Ok(Some(message)) => Some(message),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use async_graphql::{Request, Response, Value};
    use futures::FutureExt as _;
    use linera_sdk::{util::BlockingWait, views::View, Service, ServiceRuntime};
    use serde_json::json;

    use super::{DeadKeysService, DeadKeysState};

    #[test]
    fn query() {
        let value = 61_098_721_u64;
        let runtime = Arc::new(ServiceRuntime::<DeadKeysService>::new());
        let mut loaded = DeadKeysState::load(runtime.root_view_storage_context())
            .blocking_wait()
            .expect("Failed to read from mock key value store");
        // Insert a test score for game123
        loaded
            .scores
            .insert("game123", value)
            .expect("Failed to set score");

        let service = DeadKeysService { state: Arc::new(loaded), runtime };
        let request = Request::new(r#"query { score(gameId:"game123") }"#);

        let response = service
            .handle_query(request)
            .now_or_never()
            .expect("Query should not await anything");

        let expected = Response::new(Value::from_json(json!({"score" : 61_098_721})).unwrap());

        assert_eq!(response, expected)
    }
}