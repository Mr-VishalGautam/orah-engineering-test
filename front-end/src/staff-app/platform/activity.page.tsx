import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { Images } from "assets/images"

import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

import { RolllStateType } from "shared/models/roll"

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    void getActivities()
  }, [getActivities])
  return (
    <S.PageContainer>
      <h2>All Activity</h2>
      {data?.activity.map((ele, index) => (
        <S.Activity key={ele.entity.id}>
          <Toolbar id={ele.entity.name} roll={ele.entity.student_roll_states} date={ele.date} data={data} />
          {ele.entity.student_roll_states.map((item, idx) => (
            <ListTile key={idx} id={item.student_id} state={item.roll_state} />
          ))}
        </S.Activity>
      ))}
    </S.PageContainer>
  )
}
interface ToolbarProps {
  roll: any
  date: Date
  id: string
  
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { roll, date, id } = props
  
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])
  
  const calculate = (state: RolllStateType) => {
    let total: number = 0
    if (state === "unmark") {
      if (data) {
        return data?.students?.length - roll?.length
      }
    }
    roll.map((r: any) => {
      if (r.roll_state === state) total++
    })
    return total
  }

  return (
    <S.ToolbarContainer>
      <h2>#{id}</h2>
      <div></div>
      <h3>{new Date(date).toDateString()}</h3>
      <S.List>
        <li>
          Present: <S.Present>{calculate("present")}</S.Present>
        </li>
        <li>
          Late: <S.Late>{calculate("late")}</S.Late>
        </li>
        <li>
          Absent: <S.Absent>{calculate("absent")}</S.Absent>
        </li>
        <li>
          Unmarked: <S.Unmark>{calculate("unmark")}</S.Unmark>
        </li>
      </S.List>
    </S.ToolbarContainer>
  )
}
interface ListTileProps {
  id: number
  state: string
}
const ListTile: React.FC<ListTileProps> = (props) => {
  const { id, state } = props

  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const getStudentName = () => {
    const x = data?.students.find((s) => s.id === id)
    if (x) {
      return x.first_name + " " + x.last_name
    } else {
      return "N-A"
    }
  }

  return (
    <S.Container>
      <S.Avatar url={Images.avatar}></S.Avatar>

      <S.Content>
        {" "}
        <div>{getStudentName()}</div>{" "}
      </S.Content>
      <S.State>
        <RollStateIcon type={state} size={20} />
      </S.State>
    </S.Container>
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
  Container: styled.div`
    margin-top: ${Spacing.u3};
    padding-right: ${Spacing.u2};
    display: flex;
    height: 60px;
    border-radius: ${BorderRadius.default};
    background-color: #fff;
    box-shadow: 0 2px 7px rgba(5, 66, 145, 0.13);
    transition: box-shadow 0.3s ease-in-out;
    align-items: center;
    &:hover {
      box-shadow: 0 2px 7px rgba(5, 66, 145, 0.26);
    }
  `,
  Avatar: styled.div<{ url: string }>`
    width: 60px;
    background-image: url(${({ url }) => url});
    border-top-left-radius: ${BorderRadius.default};
    border-bottom-left-radius: ${BorderRadius.default};
    background-size: cover;
    background-position: 50%;
    align-self: stretch;
  `,
  Content: styled.div`
    flex-grow: 1;
    padding: ${Spacing.u2};
    color: ${Colors.dark.base};
    font-weight: ${FontWeight.strong};
  `,

  Activity: styled.div`
    margin-top: 60px;
  `,
  List: styled.ul`
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 18px;
    list-style: none;
  `,
  Present: styled.span`
    display: inline-block;
    background-color: #13943b;
    padding: 3px 10px;
    border-radius: 30%;
    margin-left: 10px;
    background-color: green;
  `,

  Late: styled.span`
    display: inline-block;
    background-color: #13943b;
    padding: 3px 10px;
    border-radius: 30%;
    margin-left: 10px;
    background-color: grey;
  `,

  Absent: styled.span`
    display: inline-block;
    background-color: #13943b;
    padding: 3px 10px;
    border-radius: 30%;
    margin-left: 10px;
    background-color: red;
  `,

  Unmark: styled.span`
    display: inline-block;
    background-color: #13943b;
    padding: 3px 10px;
    border-radius: 30%;
    margin-left: 10px;
    background-color: black;
  `,
  State: styled.div``,
}
