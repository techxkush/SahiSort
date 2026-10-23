// app.tsx — Pure global script with zero import/export and no generic type errors.
// Relies entirely on global window.React and window.api.

(function () {
  const globalWindow = window as any;
  const React = globalWindow.React;
  const useState = React.useState;
  const useEffect = React.useEffect;
  const api = globalWindow.api;

  function App() {
    const [route, setRoute] = useState('home');
    const [param, setParam] = useState(null);

    useEffect(() => {
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '');
        const parts = hash.split('/');
        setRoute(parts[0] || 'home');
        setParam(parts[1] || null);
      };
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (r: string, p: string | null = null) => {
      window.location.hash = p ? `${r}/${p}` : r;
    };

    // Navigation Header
    const header = React.createElement('header', { className: 'site-header' },
      React.createElement('div', { className: 'container nav-bar' },
        React.createElement('div', {
          className: 'brand',
          onClick: () => navigate('home'),
          style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem', fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600 }
        },
          React.createElement('span', { className: 'brand-dot', style: { width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--accent-leaf)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } }, 'S'),
          React.createElement('span', null, 'SahiSort')
        ),
        React.createElement('nav', { className: 'nav-links', style: { display: 'flex', gap: '0.5rem' } },
          React.createElement('a', { className: `nav-link ${route === 'home' ? 'active' : ''}`, onClick: () => navigate('home') }, 'Home'),
          React.createElement('a', { className: `nav-link ${route === 'discover' ? 'active' : ''}`, onClick: () => navigate('discover') }, 'Discover'),
          React.createElement('a', { className: `nav-link ${route === 'recreate' ? 'active' : ''}`, onClick: () => navigate('recreate') }, 'RE:CREATE'),
          React.createElement('a', { className: `nav-link ${route === 'collection' ? 'active' : ''}`, onClick: () => navigate('collection') }, 'Collection'),
          React.createElement('a', { className: `nav-link ${route === 'journey' ? 'active' : ''}`, onClick: () => navigate('journey') }, 'Journey'),
          React.createElement('a', { className: `nav-link ${route === 'guide' ? 'active' : ''}`, onClick: () => navigate('guide') }, 'Guide'),
          React.createElement('a', { className: `nav-link ${route === 'about' ? 'active' : ''}`, onClick: () => navigate('about') }, 'About')
        )
      )
    );

    let content = null;

    if (route === 'home') {
      content = React.createElement('div', { className: 'container section-pad grid-2' },
        React.createElement('div', null,
          React.createElement('span', { className: 'eyebrow' }, 'Material Intelligence Studio'),
          React.createElement('h1', { style: { fontSize: '3.5rem', marginBottom: '1rem' } }, 'Sort it right. Give it a second life.'),
          React.createElement('p', { style: { fontSize: '1.15rem', color: 'var(--text-charcoal)', marginBottom: '2rem' } }, 'Discover what your everyday objects are made of, where they belong, and what they could become next.'),
          React.createElement('div', { style: { display: 'flex', gap: '1rem' } },
            React.createElement('button', { className: 'btn btn-primary', onClick: () => navigate('discover') }, 'Discover an Object'),
            React.createElement('button', { className: 'btn btn-secondary', onClick: () => navigate('recreate') }, 'Explore RE:CREATE')
          )
        ),
        React.createElement('div', { className: 'surface-card', style: { background: 'linear-gradient(135deg, #FFF, #EDF4E8)' } },
          React.createElement('span', { className: 'pill pill-verified', style: { marginBottom: '1rem' } }, 'Daylight Specimen Table'),
          React.createElement('h3', null, 'Culinary Soda-Lime Glass Jar'),
          React.createElement('p', null, 'Separable tinplate lug cap • Closed-loop cullet OR calibrated pantry tare vessel.')
        )
      );
    } else if (route === 'discover' && !param) {
      const [desc, setDesc] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!desc.trim()) return;
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('description', desc.trim());
          const res = await api.discoverObject(formData);
          localStorage.setItem('sahisort_active_discovery_id', res.id);
          navigate('discover', res.id);
        } catch (err: any) {
          alert(err.message);
        } finally {
          setLoading(false);
        }
      };

      content = React.createElement('div', { className: 'container section-pad', style: { maxWidth: '700px' } },
        React.createElement('span', { className: 'eyebrow' }, 'Object Intelligence'),
        React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, 'Discover an Object'),
        React.createElement('p', { style: { marginBottom: '2rem' } }, 'Describe an everyday object to analyze its material composition and disposal guidelines.'),
        React.createElement('form', { onSubmit: handleSubmit, className: 'surface-card' },
          React.createElement('div', { style: { marginBottom: '1.5rem' } },
            React.createElement('label', { style: { display: 'block', fontWeight: 600, marginBottom: '0.5rem' } }, 'Object Description'),
            React.createElement('textarea', {
              rows: 4,
              className: 'textarea-field',
              placeholder: 'e.g., Empty clear glass pasta sauce jar with metal lid...',
              value: desc,
              onChange: (e: any) => setDesc(e.target.value)
            })
          ),
          React.createElement('button', { type: 'submit', className: 'btn btn-primary', disabled: loading }, loading ? 'Analyzing...' : 'Analyse Object')
        )
      );
    } else if (route === 'discover' && param) {
      const [discovery, setDiscovery] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        api.getDiscovery(param).then(setDiscovery).finally(() => setLoading(false));
      }, [param]);

      if (loading || !discovery) {
        content = React.createElement('div', { className: 'container section-pad' },
          React.createElement('div', { className: 'surface-card' }, 'Loading discovery record...')
        );
      } else {
        const d: any = discovery;
        const rec = d.recommendation;
        content = React.createElement('div', { className: 'container section-pad', style: { maxWidth: '900px' } },
          React.createElement('div', { className: 'surface-card', style: { marginBottom: '2rem' } },
            React.createElement('span', { className: 'eyebrow' }, 'Living Discovery'),
            React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '0.4rem' } }, d.object_name),
            React.createElement('p', null, d.short_description),
            React.createElement('div', { style: { margin: '1.5rem 0' } },
              React.createElement('strong', null, 'Materials: '),
              d.materials.map((m: any) => m.material).join(', ')
            ),
            React.createElement('button', { className: 'btn btn-secondary', onClick: () => navigate('recreate', d.id) }, 'Explore RE:CREATE Studio Ideas')
          ),
          rec && React.createElement('div', { className: 'surface-card' },
            React.createElement('span', { className: `pill ${rec.status === 'VERIFIED' ? 'pill-verified' : 'pill-conditional'}` }, rec.status),
            React.createElement('h2', { style: { fontSize: '2rem', margin: '0.5rem 0' } }, rec.disposal_category),
            React.createElement('p', null, rec.reasoning),
            React.createElement('h4', { style: { marginTop: '1.5rem' } }, 'Preparation Steps:'),
            React.createElement('ul', null, rec.preparation_instructions.map((s: string, i: number) => React.createElement('li', { key: i }, s))),
            rec.source_evidence.length > 0 && React.createElement('blockquote', { className: 'evidence-excerpt' }, `“${rec.source_evidence[0].excerpt}”`),
            React.createElement('div', { style: { marginTop: '1.5rem' } },
              d.disposal_confirmed
                ? React.createElement('span', { className: 'pill pill-verified' }, 'Confirmed Disposal')
                : React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: async () => {
                      const res = await api.confirmDisposal(d.id, rec.disposal_category);
                      setDiscovery(res.discovery);
                    }
                  }, 'Confirm I Sorted This Object')
            )
          )
        );
      }
    } else if (route === 'recreate') {
      const discId = param || localStorage.getItem('sahisort_active_discovery_id') || '';
      const [projects, setProjects] = useState([]);
      const [loading, setLoading] = useState(false);

      const handleGen = async () => {
        if (!discId) return;
        setLoading(true);
        try {
          const res = await api.generateRecreate(discId, {});
          setProjects(res.projects);
        } finally {
          setLoading(false);
        }
      };

      content = React.createElement('div', { className: 'container section-pad' },
        React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, 'RE:CREATE Studio'),
        React.createElement('p', { style: { marginBottom: '2rem' } }, 'Transform your discovered object into a practical second-life project.'),
        React.createElement('button', { className: 'btn btn-primary', onClick: handleGen, style: { marginBottom: '2rem' }, disabled: loading }, loading ? 'Generating...' : 'Generate RE:CREATE Blueprints'),
        React.createElement('div', { className: 'grid-3' },
          projects.map((p: any) => React.createElement('div', { key: p.id, className: 'surface-card' },
            React.createElement('span', { className: 'eyebrow' }, p.category),
            React.createElement('h3', null, p.title),
            React.createElement('p', null, p.description),
            React.createElement('button', {
              className: 'btn btn-secondary',
              style: { width: '100%', marginTop: '1rem' },
              onClick: () => navigate('project', p.id)
            }, 'View Blueprint')
          ))
        )
      );
    } else if (route === 'project' && param) {
      const [project, setProject] = useState(null);
      useEffect(() => {
        api.getProject(param).then(setProject).catch(() => {});
      }, [param]);

      if (!project) {
        content = React.createElement('div', { className: 'container section-pad' }, 'Loading project...');
      } else {
        const p: any = project;
        content = React.createElement('div', { className: 'container section-pad', style: { maxWidth: '800px' } },
          React.createElement('div', { className: 'surface-card' },
            React.createElement('h1', null, p.title),
            React.createElement('p', null, p.description),
            React.createElement('div', { style: { margin: '1.5rem 0' } },
              React.createElement('strong', null, 'Steps:'),
              React.createElement('ol', null, p.steps.map((s: string, i: number) => React.createElement('li', { key: i, style: { margin: '0.5rem 0' } }, s)))
            ),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: async () => {
                await api.completeProject(p.id);
                setProject({ ...p, is_completed: true });
              }
            }, p.is_completed ? 'Completed' : 'Mark Completed')
          )
        );
      }
    } else if (route === 'collection') {
      const [col, setCol] = useState(null);
      useEffect(() => {
        api.getCollection().then(setCol).catch(() => {});
      }, []);

      content = React.createElement('div', { className: 'container section-pad' },
        React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '1.5rem' } }, 'Personal Collection'),
        col && React.createElement('div', { className: 'grid-3' },
          (col as any).discoveries.map((d: any) => React.createElement('div', { key: d.id, className: 'surface-card' },
            React.createElement('h3', null, d.object_name),
            React.createElement('p', null, d.short_description),
            React.createElement('button', {
              className: 'btn btn-secondary',
              style: { width: '100%', marginTop: '1rem' },
              onClick: () => navigate('discover', d.id)
            }, 'Open Record')
          ))
        )
      );
    } else if (route === 'journey') {
      const [journey, setJourney] = useState(null);
      useEffect(() => {
        api.getJourney().then(setJourney).catch(() => {});
      }, []);

      content = React.createElement('div', { className: 'container section-pad' },
        React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '1.5rem' } }, 'Sustainability Journey'),
        journey && React.createElement('div', { className: 'grid-3' },
          React.createElement('div', { className: 'surface-card' },
            React.createElement('h2', null, (journey as any).metrics.total_discoveries),
            React.createElement('p', null, 'Total Discoveries')
          ),
          React.createElement('div', { className: 'surface-card' },
            React.createElement('h2', null, (journey as any).metrics.confirmed_disposal_actions),
            React.createElement('p', null, 'Confirmed Disposals')
          )
        )
      );
    } else if (route === 'guide') {
      const [guide, setGuide] = useState(null);
      useEffect(() => {
        api.getGuide().then(setGuide).catch(() => {});
      }, []);

      content = React.createElement('div', { className: 'container section-pad', style: { maxWidth: '850px' } },
        React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '0.5rem' } }, 'Evidence Guide'),
        guide && React.createElement('p', null, `${(guide as any).guide_title} (${(guide as any).jurisdiction})`),
        guide && React.createElement('div', { style: { marginTop: '2rem', display: 'grid', gap: '1rem' } },
          (guide as any).passages.map((p: any) => React.createElement('div', { key: p.id, className: 'surface-card' },
            React.createElement('strong', null, p.section),
            React.createElement('blockquote', { className: 'evidence-excerpt' }, `“${p.excerpt}”`)
          ))
        )
      );
    } else if (route === 'about') {
      content = React.createElement('div', { className: 'container section-pad', style: { maxWidth: '800px' } },
        React.createElement('div', { className: 'surface-card' },
          React.createElement('h1', { style: { fontSize: '2.5rem', marginBottom: '1rem' } }, 'About SahiSort'),
          React.createElement('p', null, 'SahiSort combines material intelligence, source-grounded municipal disposal guidance, and creative reuse studios.')
        )
      );
    }

    return React.createElement('div', { style: { minHeight: '100vh', display: 'flex', flexDirection: 'column' } },
      header,
      React.createElement('main', { style: { flex: 1 } }, content)
    );
  }

  globalWindow.App = App;
})();