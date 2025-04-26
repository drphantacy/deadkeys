use async_graphql::{Request, Response};
use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi};
use serde::{Serialize, Deserialize};

pub struct DeadKeysAbi;

impl ContractAbi for DeadKeysAbi {
    type Operation = Operation;
    type Response = u64;
}

impl ServiceAbi for DeadKeysAbi {
    type Query = Request;
    type QueryResponse = Response;
}

/// Operation for game-specific score updates
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub game_id: String,
    pub value: u64,
}