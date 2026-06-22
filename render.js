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

    // 添加图片
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

function createPage(pageNum) {
    const page = document.createElement('div');
    page.className = 'page';

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

    // 每页放置的文章数量（CSS columns会自动在三列间分配）
    const articlesPerPage = 12;

    // 将文章分组为页面
    const pages = [];
    for (let i = 0; i < articles.length; i += articlesPerPage) {
        pages.push(articles.slice(i, i + articlesPerPage));
    }

    // 将两个页面组成一个spread（对开页）
    for (let i = 0; i < pages.length; i += 2) {
        const spread = document.createElement('div');
        spread.className = 'spread';

        // 左页
        const leftPage = createPage(i + 1);
        if (pages[i]) {
            pages[i].forEach(article => {
                leftPage.content.appendChild(createArticleElement(article));
            });
        }
        spread.appendChild(leftPage.page);

        // 右页
        const rightPage = createPage(i + 2);
        if (pages[i + 1]) {
            pages[i + 1].forEach(article => {
                rightPage.content.appendChild(createArticleElement(article));
            });
        }
        spread.appendChild(rightPage.page);

        spreadContainer.appendChild(spread);

        // 跨页之间添加分割线
        if (i + 2 < pages.length) {
            const divider = document.createElement('div');
            divider.className = 'spread-divider';
            spreadContainer.appendChild(divider);
        }
    }
}
