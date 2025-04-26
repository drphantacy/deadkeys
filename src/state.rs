use linera_sdk::views::{linera_views, MapView, RootView, ViewStorageContext};

/// The application state.
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct DeadKeysState {
    pub scores: MapView<String, u64>,
}