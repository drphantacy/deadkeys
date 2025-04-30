use async_graphql::{Request, Response};
use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi, ChainId};
use serde::{Serialize, Deserialize};

pub mod models;

pub struct DeadKeysAbi;

impl ContractAbi for DeadKeysAbi {
    type Operation = Operation;
    type Response = u64;
}

impl ServiceAbi for DeadKeysAbi {
    type Query = Request;
    type QueryResponse = Response;
}

/// Contract operations: score updates and cross-chain sends
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    UpdateScore { game_id: String, value: u64 },
    Send { target_chain: ChainId, word: String, msg_type: String },
}

/// Cross-chain message payloads: Send/Receive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    Send    { word: String, msg_type: String },
    Receive { word: String, msg_type: String },
}