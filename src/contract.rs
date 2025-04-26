// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use deadkeys::{DeadKeysAbi, Operation}; // Import ABI and Operation struct
use linera_sdk::{
    linera_base_types::WithContractAbi,
    util::BlockingWait as _,        // For synchronous MapView.get in contract
    views::{RootView, View},
    Contract, ContractRuntime,
};

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
    type Message = ();
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
        // Read existing score synchronously in contract context
        let current = self.state
            .scores
            .get(&operation.game_id)
            .blocking_wait()          // sync wait for get future
            .unwrap_or_default()      // Result<Option<u64>, _> -> Option<u64>
            .unwrap_or_default();     // Option<u64> -> u64
        let new_score = current + operation.value;
        // Persist updated score immediately
        self.state
            .scores
            .insert(&operation.game_id, new_score)
            .expect("Failed to insert score");
        new_score
    }

    async fn execute_message(&mut self, _message: ()) {
        panic!("DeadKeys application doesn't support any cross-chain messages");
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
    use deadkeys::Operation;
    use super::{DeadKeysContract, DeadKeysState};

    #[test]
    fn operation() {
        let mut contract = create_and_instantiate_DeadKeys(0);
        let increment = 42_308_u64;
        let op = Operation { game_id: "game1".to_string(), value: increment };

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
    #[should_panic(expected = "DeadKeys application doesn't support any cross-chain messages")]
    fn message() {
        let initial_value = 72_u64;
        let mut DeadKeys = create_and_instantiate_DeadKeys(initial_value);

        DeadKeys
            .execute_message(())
            .now_or_never()
            .expect("Execution of DeadKeys operation should not await anything");
    }

    #[test]
    fn cross_application_call() {
        let mut contract = create_and_instantiate_DeadKeys(0);
        let increment = 8_u64;
        let op = Operation { game_id: "game2".to_string(), value: increment };

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