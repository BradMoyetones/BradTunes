use serde::ser::SerializeStruct;
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Internal error: {0}")]
    Internal(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("AppError", 3)?;

        let (code, category) = match self {
            AppError::Internal(_) => ("INTERNAL", "system"),
        };

        state.serialize_field("code", code)?;
        state.serialize_field("category", category)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}
