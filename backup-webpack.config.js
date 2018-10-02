const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const src = path.join(__dirname, 'src');

module.exports = {
    devServer: {
        hot: true
    },
    stats: {
        assets: false,
        colors: true,
        version: false,
        hash: true,
        timings: true,
        chunks: false,
        chunkModules: false
    },
    entry: {
        styles: path.join(src, 'sass/resume.scss'),
        index: path.join(src, 'templates/index.pug'),
        bundle: path.join(src, 'js/app.js'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        rules: [ {
            test: /\.pug(\?.*)?$/,
            use:  ['html-loader',
            {
                loader: 'pug-html-loader',
                options: {
                    exports: false,
                    data: (() => JSON.parse(fs.readFileSync(path.join(src, 'templates/content/bbarker.json'))))()
                }
            } ]
        }, {
            test: /\.(sass|scss)$/,
            use: [
                process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader'
            ]
        }, {
            test: /\.(gif|png|jpe?g|svg)$/,
            use: [
                'file-loader',
                {
                    loader: 'image-webpack-loader',
                    options: {
                       /*mozjpeg: {
                            progressive: true,
                            quality: 65
                        },
                        // optipng.enabled: false will disable optipng
                        optipng: {
                            enabled: false,
                        },
                        pngquant: {
                            quality: '65-90',
                            speed: 4
                        },
                        gifsicle: {
                            interlaced: false,
                        },*/
                        // the webp option will enable WEBP
                        webp: {
                            method: 6,
                            quality: 75
                        }
                    }
                }
            ],
        } ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new HtmlWebpackPlugin({
            title: 'index.html',
            template: path.join(src, 'templates/index.pug'),
        }),
    ],
};