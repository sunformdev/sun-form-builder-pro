const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");  // Tối ưu hóa minify
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { watch } = require("fs");

const exportJS = {
    entry: {
        form: "./assets/js/src/blocks/form/form.js",
        "multi-step-form": "./assets/js/src/blocks/multi-step-form/multi-step-form.js",
        submit: "./assets/js/src/common/submit.js",
        admin: "./assets/js/src/common/admin.js",
        "date-field": "./assets/js/src/common/date-field.js",
        'file-upload': "./assets/js/src/common/file-upload.js",
        'image-upload': "./assets/js/src/common/image-upload.js",
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "./assets/js/minify"),
    },
    module: {
        rules: [
            {
                test: /\.js|\.jsx$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react", "@wordpress/babel-preset-default"],
                    },
                },
            },
            {
                test: /\.css$/, // Xử lý các file .css
                use: ["style-loader", "css-loader"], // Sử dụng style-loader và css-loader
            },
        ],
    },
    mode: 'development',
    //mode: 'production',
    devtool: "source-map",
    optimization: {
        minimize: false,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: false,  // Loại bỏ console.log và các câu lệnh console khác
                },
            },
        })],
    },
    externals: {
        jquery: 'jQuery' // Sử dụng jQuery có sẵn trong WordPress
    },
    watch: true
};
//CSS
const exportCss = {
    optimization: {
        minimizer: [new CssMinimizerPlugin({})],
    },
    entry: {
        form: './assets/css/src/form.css',
        admin: './assets/css/src/admin.css'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].min.css',
        })
    ],
    output: {
        //filename: '[name].js',
        path: path.resolve('./assets/css/minify')
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: '../../images',
                            publicPath: '../../images', // Đường dẫn công khai đến thư mục hình ảnh từ tệp CSS
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    /*'style-loader',*/
                    'css-loader'
                ]
            }
        ]
    },
    watch: true,
    mode: 'development'
    //mode:'production'
};
module.exports = [
    exportJS,
    exportCss
]