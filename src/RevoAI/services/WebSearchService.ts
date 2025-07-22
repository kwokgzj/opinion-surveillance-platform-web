import type { ExtractResults } from '@/RevoAI/utils/extract'
import { addAbortController } from '@/RevoAI/utils/abortController'

export interface WebSearchProviderResponse {
  query?: string
  results: Array<{
    number: number
    title: string
    url: string
    content: string
    sourceIcon: string
  }>
}

export type WebSearchFunction = (
  queryList: string[],
  options?: {
    maxResults?: number
    maxContentLength?: number
    includeRawContent?: 'text' | 'none'
  },
  signal?: AbortSignal,
) => Promise<any>

class WebSearchService {
  /**
   * 是否暂停
   */
  private signal: AbortSignal | null = null
  private customSearchFunction: WebSearchFunction | null = null

  isPaused = false

  constructor(searchFunction?: WebSearchFunction) {
    if (searchFunction) {
      this.customSearchFunction = searchFunction
    }
  }

  setSearchFunction(searchFunction: WebSearchFunction) {
    this.customSearchFunction = searchFunction
  }

  createAbortSignal(key: string) {
    const controller = new AbortController()
    this.signal = controller.signal
    addAbortController(key, () => {
      this.isPaused = true
      this.signal = null
      controller.abort()
    })
    return controller
  }
  /**
   * 直接通过后端接口进行搜索
   */
  public async searchByApi(
    queryList: string[],
    options?: {
      maxResults?: number
      maxContentLength?: number
      includeRawContent?: 'text' | 'none'
    },
  ): Promise<WebSearchProviderResponse> {
    // 如果有自定义搜索函数，则使用它
    const data: any = await this.customSearchFunction?.(
      queryList,
      options,
      this.signal || undefined,
    )

    // 否则使用默认的 HTTP 请求
    // const res = await http.post(
    //   "/api/search",
    //   {
    //     query: queryList,
    //     maxResults: options?.maxResults,
    //     maxContentLength: options?.maxContentLength,
    //     includeRawContent: options?.includeRawContent,
    //   },
    //   {
    //     signal: this.signal || undefined,
    //   }
    // );
    // const data = res.data;
    return {
      query: queryList.join(' | '),
      results: (data || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        content:
          item.snippet + (item.full_content ? '\n全文(Full Content): ' + item.full_content : ''),
        sourceIcon: item.sourceIcon,
      })),
    }
  }

  /**
   * 处理websearch流程，直接调用searchByApi
   */
  public async processWebsearch(
    extractResults: ExtractResults,
  ): Promise<WebSearchProviderResponse> {
    if (!extractResults.websearch?.question || extractResults.websearch.question.length === 0) {
      console.log('[processWebsearch] No valid question found in extractResults.websearch')
      return { results: [] }
    }
    return await this.searchByApi(extractResults.websearch.question)
  }
}

export default new WebSearchService()
