_:
    just --list

# Format all code.
fmt:
    treefmt

# Check formatting.
fmt-check:
    treefmt --ci
