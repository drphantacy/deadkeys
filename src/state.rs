use linera_sdk::views::{linera_views, RegisterView, RootView, ViewStorageContext};

/// The application state.
#[derive(RootView)]
#[view(context = "ViewStorageContext")]
pub struct DeadKeysState {
    pub value: RegisterView<u64>,
}