{
  description = "Personal Website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    # Pin Zola to 0.21.0 (pre-Giallo) so local builds match the deployed
    # syntect-class highlighting and the 2024-era abridge theme.
    # Zola 0.22.0 (Jan 2026) switched to the Giallo highlighter and renamed
    # [markdown] highlight_code/highlight_theme to [markdown.highlighting].
    zola-pin.url = "github:NixOS/nixpkgs/9109f5749810173c08090a62f2a1d418f945ca36";
  };

  outputs = { self, nixpkgs, zola-pin }:
    let
      # Covers the user's Mac (aarch64-darwin) plus Linux CI systems.
      systems = nixpkgs.lib.systems.flakeExposed;
      forEachSystem = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forEachSystem (system:
        let pkgs = nixpkgs.legacyPackages.${system};
            zola = zola-pin.legacyPackages.${system}.zola;
        in
        {
          default = pkgs.mkShell {
            packages = [
              zola
              pkgs.git
            ];
          };
        });
    };
}
