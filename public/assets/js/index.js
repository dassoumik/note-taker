let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;
let noteListLi = [];
if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelector('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  .catch((error) => {
    console.error(error);
  });


const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const deleteAllNote = () =>
  fetch(`/api/clear`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const renderActiveNote = () => {
  hide(saveNoteBtn);
  for (const element of document.querySelectorAll(".list-group .list-group-item .save-active-note")) {
    element.classList.add('d-none');
  }
  const activeElement = document.querySelectorAll(".list-group-item");
  for (const item of activeElement) {
    if (item.dataset.note.title != 'No saved Notes')  {
      if (JSON.parse(item.dataset.note).id == activeNote.id) {
        item.querySelector(".save-active-note").classList.remove('d-none');
      }
    }
  }

  if (activeNote.id) {
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then((res) => {
    getAndRenderNotes();
    activeNote = {};
    renderActiveNote();
  });
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  deleteNote(noteId).then(() => {
    let element = document.getElementById(noteId);
    element.remove();
    getAndRenderNotes();
    renderActiveNote();
    newNoteBtn.click();
  });
};

const handleNoteDeleteAll = (e) => {
  e.stopPropagation();
  deleteAllNote().then(() => {
    getAndRenderNotes();
    renderActiveNote();
  })
}

function saveEditedNote(e) {
  e.stopPropagation();
  const note = e.target;
  noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;
  const noteData = {
    "id": noteId,
    "title": noteTitle.value,
    "text": noteText.value
  }
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  }).then((res) => {
    getAndRenderNotes();
    activeNote = {};
    renderActiveNote();
  });
}

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  for (const element of document.querySelectorAll(".list-group .list-group-item .save-active-note")) {
    element.classList.add('d-none');
  }
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  e.target.parentElement.querySelector(".save-active-note").classList.remove('d-none');
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
  saveNoteBtn = document.querySelector('.save-note');
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteListLi = document.querySelectorAll('.list-group-item');
    noteListLi.forEach((el) => (el.remove()));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);



    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    const savBtnEl = document.createElement('i');
    savBtnEl.classList.add(
      'd-none',
      'fas',
      'fa-save',
      'float-right',
      'text-success',
      'save-active-note',
      'mr-2'
    );
    savBtnEl.addEventListener('click', saveEditedNote);

    liEl.append(savBtnEl);



    return liEl;
  };


  if (jsonNotes.length === 0) {
    const noNotesLi = createLi('No saved Notes', false);
    noNotesLi.setAttribute("data-note", "{title: 'No saved Notes', text =' ' id: 0}");
    noteListItems.push(noNotesLi);
  }

  if (jsonNotes.length < 2) {
    document.querySelector(".clear-note").classList.add('d-none');
  }

  if (jsonNotes.length >= 2) {
    document.querySelector(".clear-note").classList.remove('d-none');
    document.querySelector(".clear-note").addEventListener('click', handleNoteDeleteAll);
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    li.setAttribute("id", note.id);


    noteListItems.push(li);
    noteList.append(li);

    noteListLi = document.querySelectorAll('.list-group-item');
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList.append(note));
    noteListLi = document.querySelectorAll('.list-group-item');
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => getNotes().then((notes) => renderNoteList(notes));

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('keyup', handleRenderSaveBtn);
  noteText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderNotes();