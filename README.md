# Zibuke Connect

## Unified Communications Platform

Zibuke Connect is a Unified Communications platform I built as part of the Zibuke Africa Group 2 software development assessment.

The idea behind the project is to bring the main communication tools a company needs into one application instead of making users switch between different systems for phone calls, meetings and messaging.

The platform brings together:

- VoIP calling
- Video conferencing
- Screen sharing
- Private messaging
- Group/project chat rooms
- Company contacts
- User authentication
- Low-data communication options

The application is designed around a company environment where registered users can communicate with each other using one platform.

---

# The Problem

A company can use different systems for different types of communication. For example, one system may be used for phone calls, another for video meetings and another for messaging.

This creates a few problems:

- Users have to switch between different applications.
- Contact information can be spread across different systems.
- Starting a meeting or communication session can take more steps.
- Communication becomes harder to manage when teams are working on projects together.
- Video communication can use a lot of mobile data.

The goal of Zibuke Connect is to bring these communication methods together into one application.

---

# My Solution

I built Zibuke Connect as a web-based Unified Communications platform.

The application has a React frontend where users can log in, view other company users, start meetings, communicate with other users and access the different communication features.

The backend is built with NestJS and PostgreSQL. It handles application data such as users, authentication, contacts, meetings and chat information.

For the communication infrastructure, I use containerised services so that each part of the platform has a specific responsibility.

The main architecture is:

```text
                        ZIBUKE CONNECT
                              |
                    React / TypeScript
                              |
                         NestJS API
                              |
                         PostgreSQL
                              |
        ------------------------------------------------
        |                      |                       |
     VoIP                    Video                  Chat
        |                      |                       |
    Kamailio              Jitsi Meet             Chat API
        |
   FreeSWITCH 

   # How to Run the Project

## Prerequisites

Before running Zibuke Connect, make sure the following are installed:

- Docker Desktop
- Git

Docker Desktop includes Docker Compose, which is used to run the different services in the project.

Download Docker Desktop:

https://www.docker.com/products/docker-desktop/

For Windows, Docker Desktop should be configured to use the WSL2 backend.
