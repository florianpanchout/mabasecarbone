import React, { useState, useEffect, useContext, useRef } from 'react'
import styled from 'styled-components'
import { useLocation, useHistory } from 'react-router-dom'
import { matchSorter } from 'match-sorter'

import { useSearch } from 'utils/api'
import SearchContext from 'utils/SearchContext'
import TextInput from './searchBar/TextInput'
import Suggestions from './searchBar/Suggestions'

const Wrapper = styled.form`
  position: absolute;
  z-index: 100;
  top: calc(100% - 2.0625rem);
  left: 0.5rem;
  right: 0.5rem;
  background-color: ${(props) => props.theme.colors.background};
  ${(props) => props.theme.shadow};
  border: 1px solid
    rgba(
      ${(props) => props.theme.colors.quad},
      ${(props) => (props.focus ? 1 : 0.5)}
    );

  transition: box-shadow 200ms ease-out;
  transition: border 200ms ease-out;

  ${(props) => props.theme.mq.small} {
    top: calc(100% - 1.396875rem);
  }
`

export default function SearchBar() {
  let history = useHistory()
  const location = useLocation()

  const { search, setSearch, debouncedSearch } = useContext(SearchContext)

  const { data, isFetching, isPreviousData } = useSearch(debouncedSearch)

  const [results, setResults] = useState([])
  useEffect(() => {
    if (data && !isPreviousData) {
      const sortedResults = matchSorter([...data.results], debouncedSearch, {
        keys: ['Nom_base_français'],
      })
      setResults(sortedResults)
    }
    setCurrent(0)
  }, [data, debouncedSearch, isPreviousData])

  const [focus, setFocus] = useState(false)
  const input = useRef(null)
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!focus) {
      setCurrent(0)
      input.current && input.current.blur()
    }
  }, [focus])

  const navigateToProduct = (product) => {
    history.push(
      `/product/${product[`Identifiant_de_l'élément`]}${location.search}`
    )
    setSearch(product['Nom_base_français'])
    setFocus(false)
  }

  return (
    <Wrapper
      focus={focus}
      onSubmit={(e) => {
        e.preventDefault()
        if (current > -1) {
          navigateToProduct(results[current])
        }
      }}
    >
      <TextInput
        ref={input}
        search={search}
        suggestion={results[current]}
        suggestionVisible={data && focus}
        isFetching={isFetching}
        setSearch={setSearch}
        setFocus={setFocus}
      />
      {data && focus && (
        <Suggestions
          search={debouncedSearch}
          results={results}
          focus={focus}
          current={current}
          isFetching={isFetching}
          setCurrent={setCurrent}
          handleSuggestionClick={navigateToProduct}
        />
      )}
    </Wrapper>
  )
}
