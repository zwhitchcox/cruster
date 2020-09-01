# Use the official Rust image.
# https://hub.docker.com/_/rust
FROM rust:1.44.0

# Copy local code to the container image.
WORKDIR /usr/src/app

# Cache Rust dependencies
COPY dummy.rs .
COPY Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build


RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml

COPY . .

# Install production dependencies and build a release artifact.
RUN cargo install --path .

# Run the web service on container startup.
CMD ["hellorust"]

EXPOSE 3030
