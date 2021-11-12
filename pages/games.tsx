import React, { useState, useReducer, useCallback, useEffect } from "react"
import Link from "next/link"

import Button from "@material-tailwind/react/Button"
import Tab from "@material-tailwind/react/Tab"
import TabList from "@material-tailwind/react/TabList"
import TabItem from "@material-tailwind/react/TabItem"
import TabContent from "@material-tailwind/react/TabContent"
import TabPane from "@material-tailwind/react/TabPane"
import Icon from "@material-tailwind/react/Icon"

import ButtonMasher from "../components/button-masher"
import BottleDodger from "../components/bottle-dodger"

export default function Games() {
  const [openTab, setOpenTab] = useState(1)

  return (
    <div>
      <Link href="/">
        <Button buttonType="link" ripple="light">
          <Icon name="arrow_back" size="xl" />
          Home
        </Button>
      </Link>
      <div className="flex justify-center">
        <Button
          className="m-1"
          buttonType={`${openTab === 1 ? "filled" : "outline"}`}
          color="indigo"
          onClick={() => setOpenTab(1)}
        >
          <Icon name="local_drink" size="lg" />
          Bottle Masher
        </Button>
        <Button
          className="m-1"
          buttonType={`${openTab === 2 ? "filled" : "outline"}`}
          color="indigo"
          onClick={() => setOpenTab(2)}
        >
          <Icon name="opacity" size="lg" />
          Bottle Dodger
        </Button>
      </div>
      <div className="p-2">
        {openTab === 1 && <ButtonMasher />}
        {openTab === 2 && <BottleDodger />}
      </div>
    </div>
  )
}
