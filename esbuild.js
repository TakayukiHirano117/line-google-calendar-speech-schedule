import esbuild from "esbuild";
import { GasPlugin } from "esbuild-gas-plugin";
import { promises as fs } from "fs";

// HTMLファイルをテキストとして読み込むプラグイン
const htmlPlugin = {
    name: 'html-loader',
    setup(build) {
        build.onLoad({ filter: /\.html$/ }, async (args) => {
            const contents = await fs.readFile(args.path, 'utf8');
            return {
                contents: JSON.stringify(contents),
                loader: 'json',
            };
        });
    },
};

esbuild
    .build({
        entryPoints: ["./src/main.ts"],
        bundle: true,
        minify: false,
        target: 'es2015',
        format: 'iife',
        outfile: "./dist/main.js",
        plugins: [htmlPlugin, GasPlugin],
        tsconfigRaw: {
            compilerOptions: {
                useDefineForClassFields: false,
            },
        },
    })
    .catch((error) => {
        console.log('ビルドに失敗しました')
        console.error(error);
        process.exit(1);
    });
