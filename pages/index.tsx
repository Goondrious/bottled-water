import React, { useState, ReactNode } from "react"
import Head from "next/head"
import Link from "next/link"
import Button from "@material-tailwind/react/Button"
import Icon from "@material-tailwind/react/Icon"
import Label from "@material-tailwind/react/Label"

import Quote from "@material-tailwind/react/Quote"

import Image from "@material-tailwind/react/Image"
import Modal from "@material-tailwind/react/Modal"
import ModalHeader from "@material-tailwind/react/ModalHeader"
import ModalBody from "@material-tailwind/react/ModalBody"
import ModalFooter from "@material-tailwind/react/ModalFooter"

import Card from "@material-tailwind/react/Card"
import CardHeader from "@material-tailwind/react/CardHeader"
import CardBody from "@material-tailwind/react/CardBody"
import CardFooter from "@material-tailwind/react/CardFooter"
import H6 from "@material-tailwind/react/Heading6"
import Paragraph from "@material-tailwind/react/Paragraph"

import { getStaticHomePageContent } from "../lib/aws"

export async function getStaticProps() {
  const { mdContent } = await getStaticHomePageContent()
  return {
    props: {
      mdContent,
    },
  }
}

const getModalHeader = (contentType: string): string => {
  if (contentType === "thoughts") return "The Thoughts"
  if (contentType === "movement") return "The Movement"
  if (contentType === "info") return "The Info"
  return ""
}

const MODAL_TYPES: string[] = ["movement", "thoughts", "info"]
const showModal = (type) => MODAL_TYPES.includes(type)

export default function Home({ mdContent }) {
  const [modalState, setModalState] = useState("")
  return (
    <div>
      <Head>
        <title>Bottled Water Is Silly</title>
        <link rel="icon" href="/bottles.ico" />
      </Head>
      <main className="w-full">
        <div className="flex flex-wrap justify-center w-full lg:h-4/5">
          {/* Header */}
          <div className="prose text-center w-full md:w-1/2 p-2 md:pt-48">
            <h1>Bottled Water Is Silly!</h1>
            <h3>So very, very silly...</h3>
            <p className="text-base leading-relaxed text-gray-600 font-normal">
              With access to safe municipal drinking water and filters, the preference should be to use a reusable
              bottle or glass. It's simple:
            </p>
            <h4>Just get a refillable bottle!</h4>
          </div>
          <div className="relative w-full md:w-1/2 p-2 flex items-center justify-center">
            <Image className="w-full lg:w-10/12" src="/bottles.png" raised alt="reusable water bottles" />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 p-1 lg:p-4 gap-4 mt-2">
          <Card className="mt-4">
            <CardHeader>
              <H6 color="white">The Games</H6>
            </CardHeader>
            <CardBody>
              <Paragraph color="gray">Test your skill and commitment to refillables!</Paragraph>
            </CardBody>
            <CardFooter className="flex justify-center">
              <Link href="/games">
                <Button color="indigo" ripple="light">
                  <Icon name="sports_esports" size="xl" />
                  Play
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <H6 color="white">The Thoughts</H6>
            </CardHeader>
            <CardBody>
              <Paragraph color="gray">Some basic thoughts behind BWIS</Paragraph>
            </CardBody>

            <CardFooter className="flex justify-center">
              <Button onClick={() => setModalState("thoughts")} color="indigo" size="lg" ripple="light">
                Read
              </Button>
            </CardFooter>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <H6 color="white">The Movement</H6>
            </CardHeader>
            <CardBody>
              <Paragraph color="gray">Different ways to get involved and end the silliness</Paragraph>
            </CardBody>

            <CardFooter className="flex justify-center">
              <Button onClick={() => setModalState("movement")} color="indigo" size="lg" ripple="light">
                Read
              </Button>
            </CardFooter>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <H6 color="white">The Info</H6>
            </CardHeader>
            <CardBody>
              <Paragraph color="gray">Details that you probably already know</Paragraph>
            </CardBody>

            <CardFooter className="flex justify-center">
              <Button onClick={() => setModalState("info")} color="indigo" size="lg" ripple="light">
                Read
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Modal size="lg" active={showModal(modalState)} toggler={() => setModalState("")}>
          <ModalHeader toggler={() => setModalState("")}>{getModalHeader(modalState)}</ModalHeader>
          <ModalBody>
            <div className="prose">
              {modalState === "thoughts" && <div dangerouslySetInnerHTML={{ __html: mdContent[0] }} />}
              {modalState === "info" && <div dangerouslySetInnerHTML={{ __html: mdContent[1] }} />}
              {modalState === "movement" && (
                <div>
                  <p>
                    There isn't really any movement, from this site anyways. I did, however, think of these slogans:
                  </p>
                  <div className="flex flex-col items-center p-2">
                    {[
                      "No Excuse For Single Use",
                      "Refill Not Landfill",
                      "Throttle The Bottle",
                      "What A Thrill When We Refill",
                    ].map((o) => (
                      <div className="flex items-center mb-2">
                        <Icon size="md" name="chevron_right" />
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">~Fin</footer>
    </div>
  )
}
