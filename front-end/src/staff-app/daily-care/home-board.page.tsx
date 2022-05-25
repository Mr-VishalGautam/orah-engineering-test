import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { BsSortAlphaDown } from "react-icons/bs"
import { RollInput } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [searchInput, setSearchInput] = useState("")
  const [sortType, setSortType] = useState("")
  const [isSortFirstName, setIsSortFirstName] = useState(true)
  const [stateCount, setStateCount] = useState({ present: 0, absent: 0, late: 0 })
  const [stateList, setStateList] = useState([{ Sid: 0, state: "initial" }])
  const [setRole] = useApi<{ student: RollInput }>({ url: "save-roll" })
  const [list, setList] = useState(data?.students)

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  //setting the student list as per the useApi response data
  useEffect(() => {
    let studentList = data?.students
    setList(studentList)
  }, [data])

// incrementing state for the student as per the state change
  useEffect(() => {
    let present: number, absent: number, late: number
    present = absent = late = 0

    stateList.forEach(function (student) {
      if (student.state === "present") {
        present++
      } else if (student.state === "absent") {
        absent++
      } else if (student.state === "late") {
        late++
      }
    })
    setStateCount({ present: present, absent: absent, late: late })
  }, [stateList])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }
// roll as per the overlay action
  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
      setStateCount({ present: 0, absent: 0, late: 0 })
      setStateList([{ Sid: 0, state: "initial" }])
    } else if (action === "complete") {
      setRole({ student_roll_states: stateList })
    }
  }
  // Handling the search input field
  const handleSearch = (input: any) => {
    setSearchInput(input)
  }

  // Filtering the list of student based on the search input
  const filteredSearchedStudents = (s: Person) => {

    return s.first_name.toLowerCase().indexOf(searchInput.toLowerCase()) !== -1
  }

  // Sorting the list of students by ascending & descending order  by their first and last name
  const sortStudent = (a: any, b: any) => {
    if (sortType === "ascending") {
      if (isSortFirstName) {
        if (a.first_name < b.first_name) {
          return -1
        }
      } else {
        if (a.last_name < b.last_name) {
          return -1
        }
      }
    } else if (sortType === "descending") {
      if (isSortFirstName) {
        if (a.first_name > b.first_name) {
          return 1
        }
      } else {
        if (a.last_name > b.last_name) {
          return 1
        }
      }
    }
    return 0
  }
// Listing the student with state and Id
  const studentStateList = (state: string, id: number) => {
    let list = stateList.filter((s) => s.Sid !== 0)
    const checkStudent = (id: number, arr: Array<{ Sid: number; state: string }>) => arr.find((element) => element.Sid === id)
    let isCheck = checkStudent(id, list)

    if (isCheck) {
      isCheck.state = state
    } else {
      list.push({ Sid: id, state: state })
    }
    setStateList(list)
  }

  // Filtering the student list based on the their state
  const filterByState = (state: string) => {
    const studentList = data?.students
    if (state !== "all") {
      let newArray: Array<{ id: number; first_name: string; last_name: string }> = []
      const studentWithState = stateList.filter((s) => s.state === state)
      if (studentList && studentWithState.length > 0) {
        studentList?.forEach((s) => {
          studentWithState.forEach((x) => {
            if (s.id === x.Sid) {
              newArray.push(s)
            }
          })
        })
      }
      setList(newArray)
    } else {
      setList(studentList)
    }
  }
  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          inputSearch={handleSearch}
          setSort={(data: string) => setSortType(data)}
          setNameType={(data: boolean) => setIsSortFirstName(data)}
          nameType={isSortFirstName}
          sortType={sortType}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {list
              ?.filter(filteredSearchedStudents)
              .sort(sortStudent)
              .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} studentStateList={studentStateList} />
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateCount={stateCount} totalStudents={data?.students.length} filterByState={filterByState} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  inputSearch: (input: any, value?: string) => void
  setSort: (data: any, value?: string) => void
  setNameType: (data: any, value?: string) => void
  nameType: boolean
  sortType: string
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, inputSearch, setSort, setNameType, nameType, sortType } = props

  return (
    <S.ToolbarContainer>
      <S.Name onClick={() => onItemClick("sort")}>
        <div onClick={() => setNameType(!nameType)}> {nameType === true ? "First" : "Last"} Name</div>
        <BsSortAlphaDown style={{ marginLeft: "5px", fontSize: "20px" }} onClick={() => setSort(sortType === "ascending" ? "descending" : "ascending")} />
      </S.Name>
      <S.Input placeholder="Search" onChange={(event) => inputSearch(event.target.value)} />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  Input: styled.input`
    && {
      outline: none;
      text-align: center;
    }
  `,
  Name: styled.div`
    && {
      display: flex;
      align-items: center;
    }
  `,
}
