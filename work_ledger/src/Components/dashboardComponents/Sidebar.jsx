import { NavLink } from "react-router-dom";
import logo from '../../../public/Images/logo.png'
import { useState } from "react";
// import '../../assets/js/script'
export default function Sidebar({ isOpen }) {

  return (
    <div className=" ">
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

        <aside className="sidebar" >
          <div className="sidebar-start">
            {/* <div className="sidebar-head"> */}
            {/* <a href="/" className="logo-wrapper" title="Home">
              <span className="sr-only">Home</span>
              <span className="icon logo" aria-hidden="true"></span>
              <div className="logo-text">
                <span className="logo-title">Elegant</span>
                <span className="logo-subtitle">Dashboard</span>
              </div>

            </a>  */}
            {/* <h3>Dashboard</h3> */}

            {/* </div> */}
            <div className="sidebar-body">
              <ul className="sidebar-body-menu">
                {/* <li>
                <a className="active" href="/"><span className="icon home" aria-hidden="true"></span>Dashboard</a>
              </li> */}
                <li className="ms-1">
                  <NavLink to="task" className="">
                    <i className="bi bi-list-check me-2"></i>
                    Task
                  </NavLink>
                </li>
                <li className="ms-1">
                  <NavLink to="users" className=" ">
                    <i className="bi bi-people me-2"></i>
                    People
                  </NavLink>
                </li>
                <li className="ms-1 ">
                  <NavLink to="clients" className="">
                    <i className="bi bi-person-fill-add me-2"></i>
                    Client
                  </NavLink>
                </li>
                <li className="ms-1">
                  <NavLink to="projects" className="">
                    <i className="bi bi-building-add me-2"></i>
                    Projects
                  </NavLink>
                </li>
                <li className="ms-1">
                  <NavLink to="track" className="">
                    <i className="bi bi-clock me-2"></i>
                    Tracking
                  </NavLink>
                </li>
                <li className="ms-1">
                  <NavLink to="board" className="">
                    <i className="bi bi-kanban me-2"></i>
                    Work
                  </NavLink>
                </li>

                {/* <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon document" aria-hidden="true"></span>Posts
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="posts.html">All Posts</a>
                  </li>
                  <li>
                    <a href="new-post.html">Add new post</a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon folder" aria-hidden="true"></span>Categories
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="categories.html">All categories</a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon image" aria-hidden="true"></span>Media
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="media-01.html">Media-01</a>
                  </li>
                  <li>
                    <a href="media-02.html">Media-02</a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon paper" aria-hidden="true"></span>Pages
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="pages.html">All pages</a>
                  </li>
                  <li>
                    <a href="new-page.html">Add new page</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="comments.html">
                  <span className="icon message" aria-hidden="true"></span>
                  Comments
                </a>
                <span className="msg-counter">7</span>
              </li>
            </ul>
            <span className="system-menu__title">system</span>
            <ul className="sidebar-body-menu">
              <li>
                <a href="appearance.html"><span className="icon edit" aria-hidden="true"></span>Appearance</a>
              </li>
              <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon category" aria-hidden="true"></span>Extentions
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="extention-01.html">Extentions-01</a>
                  </li>
                  <li>
                    <a href="extention-02.html">Extentions-02</a>
                  </li>
                </ul>
              </li>
              <li>
                <a className="show-cat-btn" href="##">
                  <span className="icon user-3" aria-hidden="true"></span>Users
                  <span className="category__btn transparent-btn" title="Open list">
                    <span className="sr-only">Open list</span>
                    <span className="icon arrow-down" aria-hidden="true"></span>
                  </span>
                </a>
                <ul className="cat-sub-menu">
                  <li>
                    <a href="users-01.html">Users-01</a>
                  </li>
                  <li>
                    <a href="users-02.html">Users-02</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="##"><span className="icon setting" aria-hidden="true"></span>Settings</a>
              </li> */}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


