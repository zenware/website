{
  description = "Personal Website";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" ];
      forEachSupportedsystem = f:
        nixpkgs.lib.genAttrs supportedSystems
          (system: f {
            pkgs = import nixpkgs { inherit system; };
          });
    in {
      devShells = forEachSupportedsystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = [
            pkgs.zola
            pkgs.git
          ];
        };
      });
    };
}
