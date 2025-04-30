use async_graphql::SimpleObject;
use serde::{Serialize, Deserialize};

/// Shared Zombie model for state and GraphQL
#[derive(SimpleObject, Serialize, Deserialize, Clone, Debug)]
pub struct Zombie {
    pub word: String,
    #[graphql(name = "type")]
    pub r#type: u64,
}
