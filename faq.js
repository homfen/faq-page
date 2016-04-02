/**
 * @file 帮助中心
 * @author hongfeng(homfen@outlook.com)
 */
var data = [
    {
        category: 'Bootcamp',
        questions: [
            {
                question: 'Set Up Git',
                answer: 'At the heart of GitHub is an open source version control system (VCS) called Git. Git is responsible for everything GitHub-related that happens locally on your computer.'
            },
            {
                question: 'Create A Repo',
                answer: 'On GitHub, you can store all kinds of projects in repositories. Personal repositories belong to user accounts, so after you\'ve signed up for GitHub, you can create your first repository!'
            },
            {
                question: 'Fork A Repo',
                answer: 'Most commonly, forks are used to either propose changes to someone else\'s project or to use someone else\'s project as a starting point for your own idea.'
            }
        ]
    },
    {
        category: 'Setup',
        questions: [
            {
                question: 'Setting your email in Git',
                answer: 'GitHub uses the email address you set in your local Git configuration to associate commits with your GitHub account.'
            },
            {
                question: 'Setting your username in Git',
                answer: 'Git uses your username to associate commits with an identity.'
            }
        ]
    }
];

(function () {

    var navTemplate = ''
        + '<dd class="navItem">'
        +     '<a href="#category{categoryId}">{category}</a>'
        + '</dd>';
    var categoryHead = ''
        + '<section class="category" id="category{categoryId}">'
        +     '<dl>'
        +       '<dt>{category}</dt>';
    var categoryNail = ''
        +     '</dl>'
        + '</section>';
    var questionTemplate = ''
        + '<dd id="question{questionId}" class="questionWrapper">'
        +     '<div class="question">{question}<span class="questionIcon"></span></div>'
        +     '<div class="answer"><p>{answer}</p></div>'
        + '</dd>';

    function format(str, data) {
        var newStr = str;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var reg = new RegExp('\\{' + key + '\\}', 'gm');
                newStr = newStr.replace(reg, data[key]);
            }
        }
        return newStr;
    }

    function render(data) {
        var navHtml = '';
        var contentHtml = '';
        data.forEach(function (category, i) {
            var categoryId = category.id || i;
            navHtml += format(navTemplate, {categoryId: categoryId, category: category.category});
            contentHtml += format(categoryHead, {categoryId: categoryId, category: category.category});
            category.questions.forEach(function (question, j) {
                contentHtml += format(questionTemplate, {
                    questionId: categoryId + '-' + (question.id || j),
                    question: question.question,
                    answer: question.answer
                });
            });
            contentHtml += categoryNail;
        });

        $('.nav').html(navHtml);
        $('.content').html(contentHtml);
    }

    function showByCategory(categoryId) {
        styleReset();
        $('[href="#category' + categoryId + '"]').parent().addClass('navActive');
        var category = $('.category[id="category' + categoryId + '"]');
        category.show();
    }

    function showByQuestion(categoryId, questionId) {
        var question = $('#question' + categoryId + '-' + questionId);
        question.addClass('expanded');
        question.find('.answer').toggle(true);
    }

    function styleReset() {
        $('.navActive').removeClass('navActive');
        $('.questionWrapper').removeClass('expanded');
        $('.category').hide();
        $('.answer').hide();
        $('.questionWrapper').show();
        $('.no-result').hide();
        $('.search-title').hide();
        $('.highlight').each(function () {
            $(this).replaceWith($(this).html());
        });
    }

    function getHash() {
        var hash = location.hash;
        if (hash) {
            var match = hash.match(/(category|question)(\S+)$/);
            return match[1] && match[2] && match[2].split('-');
        }
        return null;
    }

    function hashChangeHandler() {
        var search = getSearch();
        if (search) {
            location.href = location.href.split('?')[0] + location.hash;
            return;
        }
        var hash = getHash();
        if (hash) {
            var categoryId = hash[0];
            var questionId = hash[1];
            showByCategory(categoryId);
            if (!questionId) {
                var questionWrapper = $('#category' + categoryId + ' .questionWrapper').get(0);
                questionId = $(questionWrapper).attr('id').split('-')[1];
            }
            showByQuestion(categoryId, questionId);
            return true;
        }
        return false;
    }

    function getSearch() {
        var search = location.search;
        if (search) {
            return decodeURIComponent(search.split('=')[1]);
        }
        return null;
    }

    function getSearchResult(data, query) {
        var result = [];
        var reg = new RegExp(query, 'i');
        data.forEach(function (category, i) {
            var categoryId = category.id || i;
            category.questions.forEach(function (question, j) {
                var questionId = question.id || j;
                if (question.question.match(reg) || question.answer.match(reg)) {
                    result.push({categoryId: categoryId, questionId: questionId});
                }
            });
        });
        return result;
    }

    function searchHandler() {
        styleReset();
        $('.content').hide();
        var search = getSearch();
        if (search) {
            var result = getSearchResult(data, search);
            if (result.length) {
                $('.questionWrapper').hide();
                result.forEach(function (item) {
                    showByQuestion(item.categoryId, item.questionId);
                    $('#category' + item.categoryId).show();
                    var questionWrapper = $('#question' + item.categoryId + '-' + item.questionId);
                    var question = questionWrapper.find('.question');
                    var answer = questionWrapper.find('.answer');
                    question.html(question.html().replace(new RegExp(search, 'ig'), function (match) {
                        return '<span class="highlight">' + match + '</span>';
                    }));
                    answer.html(answer.html().replace(new RegExp(search, 'ig'), function (match) {
                        return '<span class="highlight">' + match + '</span>';
                    }));
                    questionWrapper.show();
                });
                $('.search-title').show();
                $('.content').show();
            }
            else {
                $('.no-result').show();
            }
            return true;
        }
        return false;
    }

    function bindEvent() {
        if (window.addEventListener) {
            window.addEventListener('hashchange', hashChangeHandler, false);
        }
        else if ('onhashchange' in window && document.documentMode > 7) {
            window.attachEvent('onhashchange', hashChangeHandler);
        }
        else {
            var hash = getHash().toString();
            setInterval(function () {
                var newHash = getHash().toString();
                if (hash !== newHash) {
                    hash = newHash;
                    hashChangeHandler();
                }
            }, 100);
        }

        $('a').on('click', function (e) {
            var href = $(this).attr('href');
            if (href[0] === '#') {
                e.preventDefault();
                location.hash = href;
                window.scroll(0, 0);
            }
        });

        $('.content').on('click', '.question', function () {
            var questionWrapper = $(this).parent();
            var expanded = !questionWrapper.hasClass('expanded');
            expanded ? questionWrapper.addClass('expanded') : questionWrapper.removeClass('expanded');
            var answer = $(this).next();
            expanded ? answer.slideDown() : answer.slideUp();
        });

        $('#searchInput').on('keyup', function (e) {
            if (e.keyCode === 13) {
                var query = $('#searchInput').val().trim();
                if (query) {
                    location.href = '?query=' + query;
                }
            }
        });

        $('#searchButton').on('click', function () {
            var query = $('#searchInput').val().trim();
            if (query) {
                location.href = '?query=' + query;
            }
        });
    }

    function init() {
        render(data);
        bindEvent();

        var search = getSearch();
        if (search) {
            $('#searchInput').val(search);
            searchHandler();
        }
        else {
            var hash = getHash();
            if (hash) {
                hashChangeHandler();
            }
            else {
                showByCategory(0);
                showByQuestion(0, 0);
            }
        }

        setTimeout(function () {
            $('.content').show();
        }, 0);

    }

    init();

})();
