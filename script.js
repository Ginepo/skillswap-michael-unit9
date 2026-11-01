// AI-assisted API integration, reviewed for this student project.
const skillGrid = document.querySelector('.skill-grid');
const filterMessage = document.getElementById('filter-message');
const filterButtons = document.querySelectorAll('[data-category]');

let skills = [];
let selectedCategory = 'All';
let isLoading = false;
let loadFailed = false;

function renderSkills() {
  skillGrid.replaceChildren();

  const matches = filterSkillsByCategory(skills, selectedCategory);

  matches.forEach(skill => {
    const card = document.createElement('article');
    card.className = 'skill-card';

    const title = document.createElement('h3');
    title.textContent = skill.title;

    const provider = document.createElement('p');
    provider.textContent = `Provider: ${skill.provider}`;

    const category = document.createElement('p');
    category.textContent = `Category: ${skill.category}`;

    const price = document.createElement('p');
    price.textContent = skill.price === 0
      ? 'Price: Free'
      : `Price: $${skill.price.toFixed(2)}/hour`;

    const details = document.createElement('p');
    details.id = `skill-details-${skill.id}`;
    details.textContent = skill.description;
    details.hidden = true;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'details-button';
    button.textContent = 'Show details';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', details.id);

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      details.hidden = expanded;
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? 'Show details' : 'Hide details';
    });

    card.append(title, provider, category, price, button, details);
    skillGrid.appendChild(card);
  });

  filterMessage.textContent = matches.length
    ? `${matches.length} skill(s) found.`
    : 'No skills found in this category.';
}

async function loadSkills() {
  isLoading = true;
  loadFailed = false;
  skillGrid.setAttribute('aria-busy', 'true');
  filterMessage.textContent = 'Loading skills...';

  try {
    const data = await window.apiService.fetchSkills();

    if (!Array.isArray(data)) {
      throw new Error('The API returned an unexpected response.');
    }

    skills = data.map(skill => ({
      ...skill,
      price: Number(skill.price)
    }));

    renderSkills();

    const matchResults = document.getElementById('match-results');
    if (matchResults) {
      matchResults.replaceChildren();
    }

    return true;
  } catch (error) {
    console.error('Error loading skills:', error);
    loadFailed = true;
    filterMessage.textContent =
      'Could not refresh skills. Check that the backend is running. ';

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Try again';
    retry.addEventListener('click', () => loadSkills());
    filterMessage.appendChild(retry);

    return false;
  } finally {
    isLoading = false;
    skillGrid.setAttribute('aria-busy', 'false');
  }
}

filterButtons.forEach(button => {
  button.setAttribute(
    'aria-pressed',
    String(button.dataset.category === selectedCategory)
  );

  button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;

    filterButtons.forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });

    if (!isLoading && !loadFailed) {
      renderSkills();
    }
  });
});

// Save new skills through the backend, then fetch the updated list.
const skillForm = document.getElementById('skill-form');
const formMessage = document.getElementById('skill-form-message');
let isSaving = false;

skillForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (isSaving || !skillForm.reportValidity()) {
    return;
  }

  const skillData = {
    title: document.getElementById('skill-title').value.trim(),
    provider: document.getElementById('skill-provider').value.trim(),
    category: document.getElementById('skill-category').value,
    price: Number(document.getElementById('skill-price').value),
    description: document.getElementById('skill-description').value.trim()
  };

  if (!skillData.title || !skillData.provider || !skillData.description ||
      !Number.isFinite(skillData.price) || skillData.price < 0) {
    formMessage.textContent = 'Enter valid details in every field.';
    return;
  }

  const submitButton = skillForm.querySelector('button[type="submit"]');
  isSaving = true;
  submitButton.disabled = true;
  formMessage.textContent = 'Saving skill...';

  try {
    await window.apiService.createSkill(skillData);
    skillForm.reset();

    const refreshed = await loadSkills();
    formMessage.textContent = refreshed
      ? 'Skill saved! Find it under Browse Skills.'
      : 'Skill saved, but the list could not refresh. Use Try again above.';
  } catch (error) {
    console.error('Error saving skill:', error);
    formMessage.textContent =
      'Could not confirm the save. Check the connection and refresh the list before submitting again.';
  } finally {
    isSaving = false;
    submitButton.disabled = false;
  }
});

// Keep the existing cost calculator connected to the tested function.
const calculatorSection = document.createElement('section');
calculatorSection.id = 'calculator';
calculatorSection.innerHTML = `
  <h2>Session Cost Calculator</h2>
  <form id="cost-form">
    <p>
      <label for="hourly-rate">Hourly rate ($)</label>
      <input id="hourly-rate" type="number" min="0" step="0.01" required>
    </p>
    <p>
      <label for="session-hours">Hours</label>
      <input id="session-hours" type="number" min="0" step="0.01" required>
    </p>
    <button type="submit">Calculate Cost</button>
  </form>
  <p id="cost-result" role="status"></p>
`;

document.querySelector('main').insertBefore(
  calculatorSection,
  document.getElementById('offer')
);

document.getElementById('cost-form').addEventListener('submit', event => {
  event.preventDefault();

  const rate = Number(document.getElementById('hourly-rate').value);
  const hours = Number(document.getElementById('session-hours').value);
  const total = calculateTotalCosts(rate, hours);

  document.getElementById('cost-result').textContent =
    `Total cost: $${total.toFixed(2)}`;
});

// Match against the skills fetched from the database.
const matchSection = document.createElement('section');
matchSection.id = 'matcher';
matchSection.innerHTML = `
  <h2>Find My Match</h2>
  <form id="match-form">
    <p>
      <label for="match-category">Category</label>
      <select id="match-category">
        <option value="Programming">Programming</option>
        <option value="Music">Music</option>
        <option value="Career">Career</option>
        <option value="Education">Education</option>
        <option value="Language">Languages</option>
      </select>
    </p>
    <p>
      <label for="match-budget">Maximum hourly price ($)</label>
      <input id="match-budget" type="number" min="0" step="0.01" required>
    </p>
    <button type="submit">Find My Match</button>
  </form>
  <div id="match-results" role="status"></div>
`;

document.querySelector('main').insertBefore(
  matchSection,
  document.getElementById('offer')
);

document.getElementById('match-form').addEventListener('submit', event => {
  event.preventDefault();

  const results = document.getElementById('match-results');
  results.replaceChildren();

  if (isLoading || loadFailed) {
    results.textContent = 'Load the skills successfully before finding a match.';
    return;
  }

  const needs = {
    category: document.getElementById('match-category').value,
    maxPrice: Number(document.getElementById('match-budget').value)
  };

  const matches = matchSkillsToUser(needs, skills);

  if (matches.length === 0) {
    results.textContent = 'No skills match your category and budget.';
    return;
  }

  matches.forEach(skill => {
    const item = document.createElement('p');
    const price = skill.price === 0
      ? 'Free'
      : `$${skill.price.toFixed(2)}/hour`;
    item.textContent = `${skill.title} - ${price}`;
    results.appendChild(item);
  });
});

loadSkills();