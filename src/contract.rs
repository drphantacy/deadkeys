#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use deadkeys::{DeadKeysAbi, Operation, Message}; // Import ABI, operations, and messages
use linera_sdk::{
    linera_base_types::WithContractAbi,
    util::BlockingWait as _,        // For synchronous MapView.get in contract
    views::{RootView, View},
    Contract, ContractRuntime,
};
use log::info;
use self::state::DeadKeysState;

pub struct DeadKeysContract {
    state: DeadKeysState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(DeadKeysContract);

impl WithContractAbi for DeadKeysContract {
    type Abi = DeadKeysAbi;
}

impl Contract for DeadKeysContract {
    type Message = Message;
    type InstantiationArgument = u64;
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = DeadKeysState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        DeadKeysContract { state, runtime }
    }

    async fn instantiate(&mut self, _initial_value: u64) {
        // Validate that the application parameters were configured correctly.
        self.runtime.application_parameters();
        // No initial scores to set.
    }

    async fn execute_operation(&mut self, operation: Operation) -> u64 {
        match operation {
            Operation::UpdateScore { game_id, value } => {
                let current = self.state
                    .scores
                    .get(&game_id)
                    .blocking_wait()
                    .unwrap_or_default()
                    .unwrap_or_default();
                let new_score = current + value;
                self.state
                    .scores
                    .insert(&game_id, new_score)
                    .expect("Failed to insert score");
                new_score
            }
            Operation::Send { target_chain, game_id, word, msg_type } => {
                let msg = Message::Send { game_id, word, msg_type };
                self.runtime
                    .prepare_message(msg)
                    .with_authentication()
                    .with_tracking()
                    .send_to(target_chain);
                0
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        // Record incoming message for front-end subscriptions
        self.state
            .incoming_messages
            .append(&message)
            .expect("Failed to record incoming message");
        match message {
            Message::Send { game_id, word, msg_type } => {
                info!("🔔 Received Send: gameId={}, word={}, type={}", game_id, word, msg_type);
            }
            Message::Receive { game_id, word, msg_type } => {
                info!("🔔 Received Receive: gameId={}, word={}, type={}", game_id, word, msg_type);
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

#[cfg(test)]
mod tests {
    use futures::FutureExt as _;
    use linera_sdk::util::BlockingWait as _;
    use linera_sdk::{util::BlockingWait, views::View, Contract, ContractRuntime};
    use deadkeys::{Operation, Message};
    use super::{DeadKeysContract, DeadKeysState};

    #[test]
    fn operation() {
        let mut contract = create_and_instantiate_DeadKeys(0);
        let increment = 42_308_u64;
        let op = Operation::UpdateScore { game_id: "game1".to_string(), value: increment };

        // Execute operation
        let response = contract
            .execute_operation(op.clone())
            .now_or_never()
            .expect("Execution of DeadKeys operation should not await anything");
        let expected_value = increment;
        assert_eq!(response, expected_value);

        // Verify stored value via blocking wait
        let stored = contract
            .state
            .scores
            .get("game1")
            .blocking_wait()
            .expect("Failed to get score");
        assert_eq!(stored.unwrap_or_default(), expected_value);
    }

    #[test]
    fn message() {
        let initial_value = 72_u64;
        let mut contract = create_and_instantiate_DeadKeys(initial_value);
        let send_msg = Message::Send { game_id: "test".to_string(), word: "foo".to_string(), msg_type: "send".to_string() };
        contract.execute_message(send_msg)
            .now_or_never()
            .expect("Send should not panic");
        let receive_msg = Message::Receive { game_id: "test".to_string(), word: "bar".to_string(), msg_type: "receive".to_string() };
        contract.execute_message(receive_msg)
            .now_or_never()
            .expect("Receive should not panic");
    }

    #[test]
    fn cross_application_call() {
        let mut contract = create_and_instantiate_DeadKeys(0);
        let increment = 8_u64;
        let op = Operation::UpdateScore { game_id: "game2".to_string(), value: increment };

        let response = contract
            .execute_operation(op.clone())
            .now_or_never()
            .expect("Execution of DeadKeys operation should not await anything");
        let expected_value = increment;
        assert_eq!(response, expected_value);

        let stored = contract
            .state
            .scores
            .get("game2")
            .blocking_wait()
            .expect("Failed to get score");
        assert_eq!(stored.unwrap_or_default(), expected_value);
    }

    fn create_and_instantiate_DeadKeys(_initial_value: u64) -> DeadKeysContract {
        let runtime = ContractRuntime::new().with_application_parameters(());
        let mut contract = DeadKeysContract {
            state: DeadKeysState::load(runtime.root_view_storage_context())
                .blocking_wait()
                .expect("Failed to read from mock key value store"),
            runtime,
        };

        contract
            .instantiate(_initial_value)
            .now_or_never()
            .expect("Initialization of DeadKeys state should not await anything");

        // No initial value to assert for game scores

        contract
    }
}