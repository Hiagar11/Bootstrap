const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const {extendDefaultPlugins} = require("svgo");
const Spritesmith = require('spritesmith');

// const sprites = ['logoDefault.svg', 'logoMobile.svg'];
// Spritesmith.run({src: sprites}, function handleResult (err, result) {
//     result.image; // Buffer representation of image
//     result.coordinates; // Object mapping filename to {x, y, width, height} of image
//     result.properties; // Object with metadata about spritesheet {width, height}
// });

const PATHS = {
    src: path.join(__dirname, 'src')
}

let mode = 'development';
if (process.env.NODE_ENV === 'production') {
    mode = 'production'
}

console.log(mode + ' mode');

module.exports = {
    mode: mode,
    output: {
        filename: "[name].[contenthash].js",
        assetModuleFilename: "assets/[hash][ext][query]",
        clean: true,
    },
    devServer: { // Добавляем элементы конфигурации
        port: 3333,
        hot: true,
        static: path.join(__dirname, "src"),
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    (mode === 'development') ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    (mode === 'development') ? 'sass-loader' : {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        "postcss-preset-env",
                                        'autoprefixer',
                                    ],
                                ]
                            }
                        }
                    },
                    "sass-loader",
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                type: (mode === 'development') ? 'asset/inline' : 'asset/resource',
            },

            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }

        ],


    },
    optimization: {
        minimizer: [
            "...",
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        // Lossless optimization with custom option
                        // Feel free to experiment with options for better result for you
                        plugins: [
                            ["gifsicle", {interlaced: true}],
                            ["jpegtran", {progressive: true}],
                            ["optipng", {optimizationLevel: 5}],
                            // Svgo configuration here https://github.com/svg/svgo#configuration
                            [
                                "svgo",
                                {
                                    plugins: extendDefaultPlugins([
                                        {
                                            name: "removeViewBox",
                                            active: false,
                                        },
                                        {
                                            name: "addAttributesToSVGElement",
                                            params: {
                                                attributes: [{xmlns: "http://www.w3.org/2000/svg"}],
                                            },
                                        },
                                    ]),
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
        new htmlWebpackPlugin({
            template: './src/index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
}