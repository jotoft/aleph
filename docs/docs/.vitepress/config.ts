import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// https://vitepress.vuejs.org/config/app-configs
export default withMermaid(
  defineConfig({
    title: 'Aleph',
    description: 'Persian Alphabet Learning App Documentation',
    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Overview', link: '/overview' },
        { text: 'Architecture', link: '/architecture' }
      ],
      sidebar: [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/overview' },
            { text: 'Architecture', link: '/architecture' }
          ]
        }
      ]
    },
    vite: {
      optimizeDeps: {
        include: ['@braintree/sanitize-url']
      }
    }
  })
)
