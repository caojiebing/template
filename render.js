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

function createPage(side, pageNum) {
    const page = document.createElement('div');
    page.className = 'page ' + (side === 'left' ? 'page-left' : 'page-right');

    page.appendChild(createHeader());

    const content = document.createElement('div');
    content.className = 'page-content';
    page.appendChild(content);

    page.appendChild(createFooter(pageNum));

    return { page, content };
}

function renderSpreads(articles) {
    const spreadContainer = document.getElementById('spreadContainer');
    spreadContainer.innerHTML = '';

    // Measure approximate article heights using a temporary container
    const measureContainer = document.createElement('div');
    measureContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${getColumnWidth()}px;
        font-family: ${getComputedStyle(document.body).fontFamily};
    `;
    document.body.appendChild(measureContainer);

    const articleHeights = articles.map(article => {
        const articleEl = createArticleElement(article);
        measureContainer.appendChild(articleEl);
        const height = articleEl.offsetHeight;
        articleEl.remove();
        return height;
    });

    document.body.removeChild(measureContainer);

    // Calculate the available content height per page
    const availableHeight = getAvailableContentHeight();
    // 6 columns per spread (2 pages × 3 columns)
    const totalColumnsPerSpread = 6;
    const heightPerColumn = availableHeight;
    // Reserve some padding between articles
    const articleGap = 6;

    // Pack articles into spreads using a height-balancing algorithm
    // We aim to distribute articles so each column has roughly equal height
    const spreads = [];
    let currentSpread = { left: [], right: [], heights: [0, 0, 0, 0, 0, 0] };
    let totalCurrentHeight = 0;
    const maxSpreadHeight = heightPerColumn; // Each column has this max height

    articles.forEach((article, index) => {
        const articleHeight = articleHeights[index] + articleGap;
        // Find the column with the smallest current height
        let minColIndex = 0;
        for (let i = 1; i < 6; i++) {
            if (currentSpread.heights[i] < currentSpread.heights[minColIndex]) {
                minColIndex = i;
            }
        }

        // Check if adding this article to the shortest column would overflow
        const columnHeights = [...currentSpread.heights];
        columnHeights[minColIndex] += articleHeight;

        // If all columns are at risk of overflow, start a new spread
        if (columnHeights[minColIndex] > maxSpreadHeight && Math.min(...currentSpread.heights) > maxSpreadHeight * 0.6) {
            spreads.push(currentSpread);
            currentSpread = { left: [], right: [], heights: [0, 0, 0, 0, 0, 0] };
            currentSpread.heights[minColIndex] = articleHeight;
            if (minColIndex < 3) {
                currentSpread.left.push(article);
            } else {
                currentSpread.right.push(article);
            }
        } else {
            currentSpread.heights[minColIndex] = columnHeights[minColIndex];
            if (minColIndex < 3) {
                currentSpread.left.push(article);
            } else {
                currentSpread.right.push(article);
            }
        }
    });

    if (currentSpread.left.length > 0 || currentSpread.right.length > 0) {
        spreads.push(currentSpread);
    }

    // Render spreads
    let pageNum = 1;
    spreads.forEach((spread, spreadIndex) => {
        const spreadEl = document.createElement('div');
        spreadEl.className = 'spread';

        const leftPage = createPage('left', pageNum);
        const rightPage = createPage('right', pageNum + 1);

        spread.left.forEach(article => {
            leftPage.content.appendChild(createArticleElement(article));
        });

        spread.right.forEach(article => {
            rightPage.content.appendChild(createArticleElement(article));
        });

        spreadEl.appendChild(leftPage.page);
        spreadEl.appendChild(rightPage.page);

        spreadContainer.appendChild(spreadEl);

        if (spreadIndex < spreads.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'spread-divider';
            spreadContainer.appendChild(divider);
        }

        pageNum += 2;
    });
}

function getColumnWidth() {
    // A4 landscape page width minus margins and gaps, divided by 3 columns
    // 297mm = 1122.5px (at 96dpi), margin 12mm × 2 = 24mm, gap 6mm × 2 = 12mm
    // (297 - 24 - 12) / 3 = 87mm per column
    return 87 * 3.7795275591; // convert mm to px
}

function getAvailableContentHeight() {
    // A4 landscape height 210mm minus margins (12mm × 2 = 24mm)
    // minus header (~14mm) minus footer (~8mm)
    // = 210 - 24 - 14 - 8 = 164mm
    return 164 * 3.7795275591; // convert mm to px
}
