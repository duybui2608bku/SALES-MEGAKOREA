import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from './Context/AppContext.tsx'
import viVN from 'antd/lib/locale/vi_VN'
import { ConfigProvider } from 'antd'
// import GlobalLoadingPage from './Utils/globalLoaddingPage.tsx'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0
    }
  }
})

// Ngặn chặn việc re-render ReactDOM.createRoot(container!)
const container = document.getElementById('root')
if (!container?.hasChildNodes()) {
  const root = ReactDOM.createRoot(container!)
  root.render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ConfigProvider locale={viVN}>
            <App />
          </ConfigProvider>
        </AppProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
