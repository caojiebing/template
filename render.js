document.addEventListener('DOMContentLoaded', function() {
    const spreadContainer = document.getElementById('spreadContainer');

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(articles => {
            renderSpreads(articles);
        })
        .catch(error => {
            spreadContainer.innerHTML = '<div class="loading">加载失败: ' + error.message + '</div>';
            console.error('Error loading data:', error);
        });
});

function createArticleElement(article) {
    const articleCard = document.createElement('div');
    articleCard.className = 'article-card';

    const titleElement = document.createElement('h2');
    titleElement.className = 'article-title';
    titleElement.textContent = article.title;

    const contentElement = document.createElement('p');
    contentElement.className = 'article-content';
    contentElement.textContent = article.content;

    articleCard.appendChild(titleElement);
    articleCard.appendChild(contentElement);

    if (article.image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'article-image-wrapper';

        const img = document.createElement('img');
        img.className = 'article-image';
        img.src = article.image;
        img.alt = article.title;
        img.loading = 'lazy';

        img.onerror = function() {
            this.parentNode.style.display = 'none';
        };

        imageWrapper.appendChild(img);
        articleCard.appendChild(imageWrapper);
    }

    return articleCard;
}

function createHeader() {
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
        <div class="header-line"></div>
        <div class="header-title-wrapper">
            <div class="title-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
            <h1 class="column-title">天下秦商</h1>
            <div class="title-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
        <div class="header-line"></div>
    `;
    return header;
}

function createFooter(pageNum) {
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `
        <div class="page-footer-left">秦商动态</div>
        <div class="page-footer-center">— ${pageNum} —</div>
        <div class="page-footer-right">天下秦商</div>
    `;
    return footer;
}

function createColumn() {
    const column = document.createElement('div');
    column.className = 'article-column';
    return column;
}

function createPage(pageNum) {
    const page = document.createElement('div');
    page.className = 'page';

    page.appendChild(createHeader());

    const content = document.createElement('div');
    content.className = 'page-content';

    // Create 3 columns for this page
    for (let i = 0; i < 3; i++) {
        content.appendChild(createColumn());
    }

    page.appendChild(content);
    page.appendChild(createFooter(pageNum));

    return { page, content, columns: content.querySelectorAll('.article-column') };
}

function renderSpreads(articles) {
    const spreadContainer = document.getElementById('spreadContainer');
    spreadContainer.innerHTML = '';

    // Distribute articles across columns evenly
    // Each spread has 2 pages × 3 columns = 6 columns
    // Each column gets articles sequentially
    const columnsPerSpread = 6;
    const totalColumns = Math.ceil(articles.length / 3); // 3 articles per column

    // Group articles into column groups of 3
    // Each group of 3 articles goes to one column
    const columnGroups = [];
    for (let i = 0; i < articles.length; i += 3) {
        columnGroups.push(articles.slice(i, i + 3));
    }

    // Group columns into spreads (6 columns per spread)
    const spreadGroups = [];
    for (let i = 0; i < columnGroups.length; i += columnsPerSpread) {
        spreadGroups.push(columnGroups.slice(i, i + columnsPerSpread));
    }

    // Render spreads
    spreadGroups.forEach((spreadData, spreadIndex) => {
        const spread = document.createElement('div');
        spread.className = 'spread';

        // Left page
        const leftPage = createPage(spreadIndex * 2 + 1);
        // Right page
        const rightPage = createPage(spreadIndex * 2 + 2);

        // Fill left page columns (first 3 column groups)
        spreadData.slice(0, 3).forEach((group, colIndex) => {
            if (colIndex < leftPage.columns.length) {
                group.forEach(article => {
                    leftPage.columns[colIndex].appendChild(createArticleElement(article));
                });
            }
        });

        // Fill right page columns (next 3 column groups)
        spreadData.slice(3, 6).forEach((group, colIndex) => {
            if (colIndex < rightPage.columns.length) {
                group.forEach(article => {
                    rightPage.columns[colIndex].appendChild(createArticleElement(article));
                });
            }
        });

        spread.appendChild(leftPage.page);
        spread.appendChild(rightPage.page);
        spreadContainer.appendChild(spread);

        // Add divider between spreads
        if (spreadIndex < spreadGroups.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'spread-divider';
            spreadContainer.appendChild(divider);
        }
    });
}
