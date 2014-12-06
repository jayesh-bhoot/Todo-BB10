function TodoReader(dataDir, fileName) {
    return (function(dataDir, fileName) {
        var dir = dataDir;
        var file = fileName;

        function populate(todoList) {
            window.resolveLocalFileSystemURL(dir, dataDirFound, operationFailed);

            function dataDirFound(dirEntry) {
                dirEntry.getFile(file, {create: true, exclusive: false},
                                 fileFound, operationFailed);
            }

            function fileFound(fileEntry) {
                fileEntry.file(fileOpened, operationFailed);
            }

            function fileOpened(file) {
                var reader = new FileReader();
                reader.onload = function(evt) {
                    var todos = evt.target.result.split('\n');
                    for (var i = 0; i < todos.length; ++i) {
                        if (!todos[i].length)
                            continue;
                        todoList.append(todos[i]);
                    }
                };
                reader.readAsText(file);
            }

            function operationFailed(error) {
                //TODO: Add better error handling here.
                console.log(error.code);
            }
        }

        return {
            populate: populate
        };
    })(dataDir, fileName);
}


function TodoWriter(dataDir, fileName) {
    return (function(dataDir, fileName) {
        var dir = dataDir;
        var file = fileName;

        function append(todo) {
            window.resolveLocalFileSystemURL(dir, dataDirFound, operationFailed);

            function dataDirFound(dirEntry) {
                dirEntry.getFile(file, {create: true, exclusive: false},
                                 fileFound, operationFailed);
            }

            function fileFound(fileEntry) {
                fileEntry.createWriter(writerCreated, operationFailed);
            }

            function writerCreated(fileWriter) {
                fileWriter.onwrite = function(evt) {
                    //TODO: Add some notification perhaps.
                };
                fileWriter.seek(fileWriter.length);
                fileWriter.write(todo + '\n');
            }

            function operationFailed(error) {
                //TODO: Add better error handling here.
                console.log(error.code);
            }
        }

        return {
            append: append
        };
    })(dataDir, fileName);
}


function TodoInput(id, todoTxt, todoList) {
    return (function(inputId, fileWriter, list) {
        var id = '#'+ inputId;
        var todoTxt = fileWriter;
        var todoList = list;

        $(id).keypress(function(evt) {
           if (evt.keyCode == 13) {
                var todo = $(this).val();
                if (todo.length) {
                    todoList.append(todo);
                    todoTxt.append(todo);
                }
                $(this).val('');
                deactivate();
            }
        });

        function activate() {
            $(id)[0].show();
            $(id).focus();
        }

        function deactivate() {
            $(id).blur();
            $(id).val('');
            $(id)[0].hide();
        }

        return {
            activate: activate,
            deactivate: deactivate
        };
    })(id, todoTxt, todoList);
}


function TodoList(id) {
    return (function(listId) {
        var id = '#' + listId;

        function getId() {
            return id;
        }

        function append(todo) {
            var item = $('<div>')
                .attr('data-bb-type', 'item')
                .html(todo)
                .swipeLeft(function() {
                    $(this).addClass('strikeout');
                    // TODO: Bring the item at the bottom of the list.
                })
                .swipeRight(function() {
                    $(this).removeClass('strikeout');
                    // Reorder on the basis of?
                });
            $(id)[0].appendItem(item[0]);
        }

        return {
            getId: getId,
            append: append
        };
    })(id);
}


function ContentArea(id, todoInput) {
    return (function(areaId, inputBox) {
        var id = '#' + areaId;
        var todoInput = inputBox;

        function setupSwipeActions() {
            $(id)
                .swipeDown(function() {
                    todoInput.activate();
                })
                .swipeUp(function() {
                    todoInput.deactivate();
                });
        }

        return {
            setupSwipeActions: setupSwipeActions
        };
    })(id, todoInput);
}


function initApp() {
    var todoList = TodoList('todoList');

    var todoReader = TodoReader(cordova.file.dataDirectory, 'todo.txt');
    todoReader.populate(todoList);

    var todoWriter = TodoWriter(cordova.file.dataDirectory, 'todo.txt');

    var todoInput = TodoInput('todoInput', todoWriter, todoList);
    var contentArea = ContentArea('content', todoInput);

    contentArea.setupSwipeActions();
    todoInput.deactivate();
}
