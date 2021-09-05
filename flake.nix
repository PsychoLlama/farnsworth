{
  description = "A very basic flake";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};

    in {
      # Use `nix develop` to enter the dev environment.
      devShell.${system} =
        pkgs.mkShell { nativeBuildInputs = [ pkgs.python3 pkgs.nodejs-16_x ]; };
    };
}
