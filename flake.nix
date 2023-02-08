{
  description = "Farnsworth Development Environment";

  # Use `nix develop` to enter the dev environment.
  outputs = { self, nixpkgs, flake-utils }:
    let inherit (nixpkgs) lib;

    in {
      devShell = lib.genAttrs lib.systems.flakeExposed (system:
        let pkgs = import nixpkgs { inherit system; };

        in pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            python3
            nodejs-16_x
            (yarn.override { nodejs = nodejs-16_x; })
          ];
        });
    };
}
