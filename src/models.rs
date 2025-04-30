use async_graphql::SimpleObject;
use serde::{Serialize, Deserialize};

/// Shared LastMessage model for state and GraphQL
#[derive(SimpleObject, Serialize, Deserialize, Clone, Debug)]
pub struct LastMessage {
    pub word: String,
    #[graphql(name = "type")]
    pub r#type: u64,
}
