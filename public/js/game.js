/**
 * public/js/game.js
 * -----------------------------------------------------------------------
 * The game engine. Reads the MISSIONS array (public/js/missions.js) and
 * drives the whole "HTTP training game" page (views/game.ejs):
 *
 *   - Renders the mission list (sidebar) with locked/completed state.
 *   - Renders the current mission's task, hint, and the request-building form.
 *   - Lets the player add/remove query-parameter rows dynamically.
 *   - On submit, builds a real URL (path + route param + query string),
 *     performs a fetch() call (AJAX) against this same server's REST API,
 *     shows the raw status code + JSON response, and validates the result
 *     using the mission's own validate() function.
 *   - Tracks score / completed missions in localStorage, so progress isn't
 *     lost on refresh and completed levels can always be revisited.
 * -----------------------------------------------------------------------
 */

(function () {
  const STORAGE_KEY = 'httpGame.progress.v1';
  const POINTS_PER_MISSION = 10;

  // ---- DOM references ----------------------------------------------------
  const missionListEl = document.getElementById('mission-list');
  const scoreEl = document.getElementById('score');
  const maxScoreEl = document.getElementById('max-score');

  const missionTitleEl = document.getElementById('mission-title');
  const missionTaskEl = document.getElementById('mission-task');
  const hintToggleEl = document.getElementById('hint-toggle');
  const missionHintEl = document.getElementById('mission-hint');

  const formEl = document.getElementById('request-form');
  const methodSelectEl = document.getElementById('method-select');
  const pathPreviewEl = document.getElementById('path-preview');

  const routeParamRowEl = document.getElementById('route-param-row');
  const routeParamNameEl = document.getElementById('route-param-name');
  const routeParamInputEl = document.getElementById('route-param-input');

  const queryRowsContainerEl = document.getElementById('query-param-rows');
  const addQueryRowBtn = document.getElementById('add-query-row');

  const bodyRowEl = document.getElementById('body-row');
  const bodyInputEl = document.getElementById('body-input');

  const responseStatusEl = document.getElementById('response-status');
  const responseBodyEl = document.getElementById('response-body');
  const feedbackBoxEl = document.getElementById('feedback-box');

  // ---- Progress (persisted in localStorage) ------------------------------
  let progress = loadProgress();
  let currentIndex = firstUnfinishedIndex();

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { completedIds: [] };
      const parsed = JSON.parse(raw);
      return { completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [] };
    } catch {
      return { completedIds: [] };
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function isCompleted(missionId) {
    return progress.completedIds.includes(missionId);
  }

  function markCompleted(missionId) {
    if (!isCompleted(missionId)) {
      progress.completedIds.push(missionId);
      saveProgress();
    }
  }

  function firstUnfinishedIndex() {
    const idx = MISSIONS.findIndex((m) => !isCompleted(m.id));
    return idx === -1 ? MISSIONS.length - 1 : idx;
  }

  function isUnlocked(index) {
    if (index === 0) return true;
    return isCompleted(MISSIONS[index - 1].id) || isCompleted(MISSIONS[index].id);
  }

  // ---- Rendering: mission list (sidebar) --------------------------------
  function renderMissionList() {
    missionListEl.innerHTML = '';
    MISSIONS.forEach((mission, index) => {
      const li = document.createElement('li');
      const unlocked = isUnlocked(index);
      const completed = isCompleted(mission.id);

      li.textContent = `${completed ? '✅ ' : unlocked ? '' : '🔒 '}${mission.title}`;
      li.className = [
        'mission-item',
        index === currentIndex ? 'active' : '',
        completed ? 'completed' : '',
        !unlocked ? 'locked' : '',
      ].filter(Boolean).join(' ');

      if (unlocked) {
        li.addEventListener('click', () => selectMission(index));
      }
      missionListEl.appendChild(li);
    });

    scoreEl.textContent = String(progress.completedIds.length * POINTS_PER_MISSION);
    maxScoreEl.textContent = String(MISSIONS.length * POINTS_PER_MISSION);
  }

  // ---- Rendering: the current mission's panel + form ---------------------
  function selectMission(index) {
    currentIndex = index;
    const mission = MISSIONS[index];

    missionTitleEl.textContent = mission.title;
    missionTaskEl.textContent = mission.task;
    missionHintEl.textContent = mission.hint;
    missionHintEl.hidden = true;
    hintToggleEl.textContent = 'Show hint';

    methodSelectEl.value = 'GET'; // reset - player must choose the correct one themselves

    routeParamRowEl.hidden = !mission.hasRouteParam;
    if (mission.hasRouteParam) {
      routeParamNameEl.textContent = mission.routeParamName;
      routeParamInputEl.value = '';
    }

    queryRowsContainerEl.innerHTML = '';
    addQueryRow(); // start with a single empty row

    bodyRowEl.hidden = !mission.needsBody;
    bodyInputEl.value = '';
    bodyInputEl.placeholder = mission.bodyPlaceholder || '';

    responseStatusEl.textContent = '-';
    responseBodyEl.textContent = '-';
    feedbackBoxEl.hidden = true;
    feedbackBoxEl.className = 'feedback-box';

    updatePathPreview();
    renderMissionList();
  }

  function addQueryRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'query-row';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.placeholder = 'key (e.g. category)';
    keyInput.value = key;
    keyInput.className = 'query-key';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'value (e.g. Fantasy)';
    valueInput.value = value;
    valueInput.className = 'query-value';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove this parameter';
    removeBtn.addEventListener('click', () => {
      row.remove();
      updatePathPreview();
    });

    keyInput.addEventListener('input', updatePathPreview);
    valueInput.addEventListener('input', updatePathPreview);

    row.appendChild(keyInput);
    row.appendChild(valueInput);
    row.appendChild(removeBtn);
    queryRowsContainerEl.appendChild(row);
  }

  function collectQueryParams() {
    const params = {};
    queryRowsContainerEl.querySelectorAll('.query-row').forEach((row) => {
      const key = row.querySelector('.query-key').value.trim();
      const value = row.querySelector('.query-value').value.trim();
      if (key) params[key] = value;
    });
    return params;
  }

  function buildPath(mission) {
    const routeParamValue = mission.hasRouteParam ? routeParamInputEl.value.trim() : '';
    let path = mission.pathTemplate.replace('{id}', routeParamValue || '{id}');
    const query = collectQueryParams();
    const qs = new URLSearchParams(query).toString();
    if (qs) path += `?${qs}`;
    return { path, routeParamValue, query };
  }

  function updatePathPreview() {
    const mission = MISSIONS[currentIndex];
    const { path } = buildPath(mission);
    pathPreviewEl.textContent = path;
  }

  routeParamInputEl.addEventListener('input', updatePathPreview);
  addQueryRowBtn.addEventListener('click', () => {
    addQueryRow();
    updatePathPreview();
  });
  methodSelectEl.addEventListener('change', updatePathPreview);

  hintToggleEl.addEventListener('click', () => {
    missionHintEl.hidden = !missionHintEl.hidden;
    hintToggleEl.textContent = missionHintEl.hidden ? 'Show hint' : 'Hide hint';
  });

  // ---- Sending the actual AJAX request ------------------------------------
  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    const mission = MISSIONS[currentIndex];
    const method = methodSelectEl.value;
    const { path, routeParamValue, query } = buildPath(mission);

    let parsedBody = null;
    const fetchOptions = { method, headers: {} };

    if (mission.needsBody) {
      const raw = bodyInputEl.value.trim();
      if (raw) {
        try {
          parsedBody = JSON.parse(raw);
        } catch {
          showFeedback(false, 'Your request body is not valid JSON. Fix the syntax and try again.');
          return;
        }
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(parsedBody);
      }
    }

    let status = 0;
    let data = null;
    try {
      const res = await fetch(path, fetchOptions);
      status = res.status;
      data = await res.json().catch(() => null);
    } catch (err) {
      responseStatusEl.textContent = 'network error';
      responseBodyEl.textContent = String(err);
      showFeedback(false, 'The request failed to reach the server (network error).');
      return;
    }

    responseStatusEl.textContent = String(status);
    responseBodyEl.textContent = JSON.stringify(data, null, 2);

    const ctx = { method, routeParam: routeParamValue, query, body: parsedBody, status, data };
    const result = mission.validate(ctx);

    if (result.success) {
      markCompleted(mission.id);
      showFeedback(true, `${result.message} (+${POINTS_PER_MISSION} points)`);
      renderMissionList();
    } else {
      showFeedback(false, result.message);
    }
  });

  function showFeedback(success, message) {
    feedbackBoxEl.hidden = false;
    feedbackBoxEl.textContent = (success ? '🎉 ' : '⚠️ ') + message;
    feedbackBoxEl.className = 'feedback-box ' + (success ? 'success' : 'failure');
  }

  // ---- Boot ---------------------------------------------------------------
  selectMission(currentIndex);
})();
