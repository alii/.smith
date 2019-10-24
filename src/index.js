const fs = require("fs");
const inquirer = require("inquirer");
const {
    minify
} = require('html-minifier');

const {
    JSDOM
} = require("jsdom");

const {
    join
} = require("path");

const initialQuestion = [{
    type: 'list',
    name: 'createOrSave',
    message: 'What do you want to do?',
    choices: [
        'Create some content',
        'Export website'
    ]
}];

inquirer.prompt([{
    type: "input",
    name: "pageTitle",
    message: "What's the page's title?"
}]).then(({
    pageTitle
}) => {
    const {
        window
    } = new JSDOM(fs.readFileSync(join(__dirname, "template.html")).toString().replace("{{title}}", pageTitle));
    const {
        document: d
    } = window;

    const prompt = data => {
        return inquirer
            .prompt(initialQuestion)
            .then(answers => {
                if (answers.createOrSave === "Create some content") {
                    const container = d.createElement("div");
                    container.classList.add("container");

                    const row = d.createElement("div");
                    row.classList.add("row");
                    container.appendChild(row);

                    const column = d.createElement("div");
                    column.classList.add("col-md");
                    container.appendChild(column);

                    d.body.appendChild(container);

                    inquirer.prompt([{
                            type: "input",
                            name: "title",
                            message: "What's the title?"
                        },
                        {
                            type: "input",
                            name: "content",
                            message: "What's the content?"
                        }
                    ]).then(answers => {
                        const title = d.createElement("h2");
                        column.appendChild(title);
                        title.innerHTML = answers.title;

                        const content = d.createElement("p");
                        column.appendChild(content);
                        content.innerHTML = answers.content;

                        return prompt(initialQuestion);
                    });

                } else {
                    if (!fs.existsSync(join(__dirname, "..", "build"))){
                        fs.mkdirSync(join(__dirname, "..", "build"));
                    }

                    fs.writeFileSync(join(__dirname, "..", "build", `${pageTitle}.html`), "<!DOCTYPE html>" + minify(window.document.documentElement.outerHTML, {
                        minifyCSS: true,
                        minifyJS: true,
                        minifyURLs: true,
                        removeComments: true,
                        removeEmptyElements: true,
                        sortClassName: true,
                        useShortDoctype: true,
                        html5: true,
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        collapseInlineTagWhitespace: true
                    }));
                }
            });
    }

    prompt(initialQuestion);
});