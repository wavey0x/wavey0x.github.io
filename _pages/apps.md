---
layout: default
title: apps
permalink: /apps/
nav: true
nav_order: 1
---

<div class="post">

<div class="apps-header">
  <h1>apps</h1>
  <p>i build open source apps to index and visualize ethereum data. Here are some open source examples:</p>
</div>

<div class="apps-grid">
{% for app in site.data.apps %}
  <div class="app-card">
    <div class="app-icon">
      {% if app.logo %}
        <img src="{{ '/assets/img/' | append: app.logo | relative_url }}" alt="{{ app.title }}">
      {% else %}
        <i class="fas fa-cube"></i>
      {% endif %}
    </div>
    <div class="app-info">
      <h3>{{ app.title }}</h3>
      <p>{{ app.description }}</p>
    </div>
    <div class="app-links">
      <a href="{{ app.url }}" class="app-link-visit" target="_blank" rel="noopener">
        Visit <i class="fas fa-arrow-right"></i>
      </a>
      <a href="{{ app.github }}" class="app-link-github" target="_blank" rel="noopener">
        <i class="fab fa-github"></i>
      </a>
    </div>
  </div>
{% endfor %}
</div>

</div>

<style>
.apps-header {
  text-align: center;
  padding: 2rem 0 2.5rem 0;
}

.apps-header h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--global-theme-color);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.apps-header p {
  font-size: 0.95rem;
  color: var(--global-text-color-light);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.5;
}

.apps-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 480px;
  margin: 0 auto;
}

.app-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--global-divider-color);
}

.app-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--global-divider-color);
  border-radius: 8px;
  color: var(--global-text-color-light);
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.app-info {
  flex: 1;
  min-width: 0;
}

.app-info h3 {
  margin: 0 0 0.2rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--global-text-color);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.app-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--global-text-color-light);
  line-height: 1.4;
}

.app-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.app-link-visit {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--global-text-color-light);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 5px;
  transition: color 0.15s ease, background 0.15s ease;
}

.app-link-visit:hover {
  color: var(--global-text-color);
  background: var(--global-divider-color);
  text-decoration: none;
}

.app-link-github {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--global-text-color);
  font-size: 1rem;
  transition: background 0.15s ease;
}

.app-link-github:hover {
  background: var(--global-divider-color);
  text-decoration: none;
}

@media (max-width: 500px) {
  .apps-header h1 {
    font-size: 2rem;
  }

  .app-card {
    padding: 0.875rem 1rem;
  }

  .app-link-visit {
    display: none;
  }
}
</style>
