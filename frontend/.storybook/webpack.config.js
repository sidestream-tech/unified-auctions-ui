const path = require('path');

module.exports = ({ config }) => {
    // load tailwind css
    config.module.rules.push({
        test: /\.css$/,
        use: [
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'postcss',
                    plugins: [require('postcss-import'), require('tailwindcss'), require('autoprefixer')],
                },
            },
        ],
        include: path.resolve(__dirname, '../'),
    });

    config.module.rules.push({
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader',
            },
            {
                loader: 'less-loader',
                options: {
                    lessOptions: {
                        javascriptEnabled: true,
                    },
                },
            },
        ],
        include: path.resolve(__dirname, '../'),
    });

    // load svg as components
    const svgRule = config.module.rules.find(rule => rule.test.test('.svg'));
    svgRule.test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;
    config.module.rules.push({
        test: /\.svg$/,
        use: ['babel-loader', 'vue-svg-loader'],
        include: path.resolve(__dirname, '../'),
    });

    // Enable tilde alias for relative imports
    config.resolve.alias['~'] = path.resolve(__dirname, '../');

    return config;
};
