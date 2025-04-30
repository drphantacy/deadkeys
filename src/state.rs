use linera_sdk::views::{linera_views, MapView, RootView, ViewStorageContext};
use deadkeys::models::Zombie;

#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct DeadKeysState {
    pub scores: MapView<String, u64>,
    /// Last global message
    pub last_message: MapView<String, Zombie>,
}