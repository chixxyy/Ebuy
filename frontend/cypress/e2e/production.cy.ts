describe('Production Environment Smoke Test', () => {
  it('Should load the frontend and fetch products successfully', () => {
    // 1. 確保首頁能正常訪問
    cy.visit('/')
    cy.get('nav').should('be.visible') // 基本的 UI 元素應該要出現
    
    // 2. 前往商品列表頁面
    cy.visit('/products')
    
    // 3. 確保 API 端點有順利回傳資料並渲染成商品卡片
    // 這裡我們檢查 .grid 內是否有至少 1 個子元素 (排除 Skeleton 載入中的情況)
    // 也可以針對商品特有的 UI 例如 a 連結到 /product/ 的 href 來判斷
    cy.get('.grid').should('be.visible')
    cy.get('.grid').children().should('have.length.at.least', 1)
    
    // 4. 更嚴謹一點，確保真的有長出「商品連結」 (代表不是全空或是在載入中)
    cy.get('a[href*="/products/"]').should('exist')
  })
})
