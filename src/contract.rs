// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use deadkeys::DeadKeysAbi; // Import DeadKeysAbi from lib.rs
use linera_sdk::{
    linera_base_types::WithContractAbi,
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

    async fn instantiate(&mut self, value: u64) {
        // Validate that the application parameters were configured correctly.
        self.runtime.application_parameters();

        self.state.value.set(value);
    }

    async fn execute_operation(&mut self, operation: u64) -> u64 {
        let new_value = self.state.value.get() + operation;
        self.state.value.set(new_value);
        new_value
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
    use linera_sdk::{util::BlockingWait, views::View, Contract, ContractRuntime};

    use super::{DeadKeysContract, DeadKeysState};

    #[test]
    fn operation() {
        let initial_value = 72_u64;
        let mut DeadKeys = create_and_instantiate_DeadKeys(initial_value);

        let increment = 42_308_u64;

        let response = DeadKeys
            .execute_operation(increment)
            .now_or_never()
            .expect("Execution of DeadKeys operation should not await anything");

        let expected_value = initial_value + increment;

        assert_eq!(response, expected_value);
        assert_eq!(*DeadKeys.state.value.get(), initial_value + increment);
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
        let initial_value = 2_845_u64;
        let mut DeadKeys = create_and_instantiate_DeadKeys(initial_value);

        let increment = 8_u64;

        let response = DeadKeys
            .execute_operation(increment)
            .now_or_never()
            .expect("Execution of DeadKeys operation should not await anything");

        let expected_value = initial_value + increment;

        assert_eq!(response, expected_value);
        assert_eq!(*DeadKeys.state.value.get(), expected_value);
    }

    fn create_and_instantiate_DeadKeys(initial_value: u64) -> DeadKeysContract {
        let runtime = ContractRuntime::new().with_application_parameters(());
        let mut contract = DeadKeysContract {
            state: DeadKeysState::load(runtime.root_view_storage_context())
                .blocking_wait()
                .expect("Failed to read from mock key value store"),
            runtime,
        };

        contract
            .instantiate(initial_value)
            .now_or_never()
            .expect("Initialization of DeadKeys state should not await anything");

        assert_eq!(*contract.state.value.get(), initial_value);

        contract
    }
}