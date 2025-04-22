#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{linera_base_types::WithServiceAbi, views::View, Service, ServiceRuntime};

use self::state::DeadKeysState;

pub struct DeadKeysService {
    state: DeadKeysState,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(DeadKeysService);

impl WithServiceAbi for DeadKeysService {
    type Abi = deadkeys::DeadKeysAbi;
}

impl Service for DeadKeysService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = DeadKeysState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        DeadKeysService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot {
                value: *self.state.value.get(),
            },
            MutationRoot {
                runtime: self.runtime.clone(),
            },
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
    async fn update_score(&self, value: u64) -> [u8; 0] {
        self.runtime.schedule_operation(&value);
        []
    }
}

struct QueryRoot {
    value: u64,
}

#[Object]
impl QueryRoot {
    async fn value(&self) -> &u64 {
        &self.value
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
        let mut state = DeadKeysState::load(runtime.root_view_storage_context())
            .blocking_wait()
            .expect("Failed to read from mock key value store");
        state.value.set(value);

        let service = DeadKeysService { state, runtime };
        let request = Request::new("{ value }");

        let response = service
            .handle_query(request)
            .now_or_never()
            .expect("Query should not await anything");

        let expected = Response::new(Value::from_json(json!({"value" : 61_098_721})).unwrap());

        assert_eq!(response, expected)
    }
}