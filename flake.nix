{
  description = "Farnsworth Development Environment";
  inputs = { flake-utils.url = "github:numtide/flake-utils"; };

  # Use `nix develop` to enter the dev environment.
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: {
      devShell = with nixpkgs.legacyPackages.${system};
        mkShell { nativeBuildInputs = [ python3 nodejs-16_x yarn ]; };
    });
}
