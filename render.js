document.addEventListener('DOMContentLoaded', function() {
    const contentArea = document.getElementById('contentArea');
    const pageNumber = document.getElementById('pageNumber');

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(articles => {
            renderArticles(articles);
            updatePageNumber();
        })
        .catch(error => {
            contentArea.innerHTML = '<div class="loading">加载失败: ' + error.message + '</div>';
            console.error('Error loading data:', error);
        });
});

function renderArticles(articles) {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = '';

    articles.forEach((article, index) => {
        const articleCard = document.createElement('article');
        articleCard.className = 'article-card';
        articleCard.dataset.index = index;

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
                img.style.display = 'none';
            };

            imageWrapper.appendChild(img);
            articleCard.appendChild(imageWrapper);
        }

        contentArea.appendChild(articleCard);
    });
}

function updatePageNumber() {
    const pageNum = 1;
    document.getElementById('pageNumber').textContent = pageNum;
}

function getPageCount() {
    const contentArea = document.getElementById('contentArea');
    const pageHeight = 1122;
    const contentHeight = contentArea.offsetHeight;
    return Math.ceil(contentHeight / pageHeight);
}