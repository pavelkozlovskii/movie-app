import { Pagination as PaginationUI } from 'antd'

export default function Pagination({ page, totalResults, onPageChange }) {
  return (
    <PaginationUI
      current={page}
      total={totalResults}
      pageSize={20}
      hideOnSinglePage
      showSizeChanger={false}
      onChange={onPageChange}
    />
  )
}
