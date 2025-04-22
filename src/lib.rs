use async_graphql::{Request, Response};
use linera_sdk::linera_base_types::{ContractAbi, ServiceAbi};

pub struct DeadKeysAbi;

impl ContractAbi for DeadKeysAbi {
    type Operation = u64;
    type Response = u64;
}

impl ServiceAbi for DeadKeysAbi {
    type Query = Request;
    type QueryResponse = Response;
}