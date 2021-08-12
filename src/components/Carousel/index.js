import React, { Component } from "react";

import { Link } from "react-router-dom";

import { IconButton, Tooltip, Typography } from "@material-ui/core";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DeleteIcon from "@material-ui/icons/Delete";
import StarIcon from "@material-ui/icons/Star";

import Swal from "sweetalert2/src/sweetalert2.js";
import "@sweetalert2/theme-dark/dark.css";

import { guid, theme } from "../../components";
import "./index.css";

export default class Carousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: props.hide || false,
      metadata: this.props.metadata,
      server:
        window.sessionStorage.getItem("server") ||
        window.localStorage.getItem("server") ||
        window.location.origin,
      star: props.star,
    };
    this.handleStar = this.handleStar.bind(this);
    this.handleStarReset = this.handleStarReset.bind(this);
    this.handleStarImport = this.handleStarImport.bind(this);
    this.handleStarExport = this.handleStarExport.bind(this);
    this.handlePin = this.handlePin.bind(this);
  }

  handleStar(item, category) {
    let { metadata } = this.state;
    let starred_lists = JSON.parse(
      window.localStorage.getItem("starred_lists") || "[]"
    );

    try {
      let index1 = starred_lists.findIndex((i) => i.id == category.id);
      let index2 = starred_lists[index1].children.findIndex(
        (i) => i.id == item.id
      );
      let index3 = metadata.findIndex((i) => i.id == category.id);
      let index4 = metadata[index3].children.findIndex((i) => i.id == item.id);
      starred_lists[index1].children.splice(index2, 1);
      metadata[index3].children.splice(index4, 1);
      window.localStorage.setItem(
        "starred_lists",
        JSON.stringify(starred_lists)
      );
      this.setState({ metadata: metadata });
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Your starred list seems to be corrupted!",
        icon: "error",
        confirmButtonText: "Reset",
        confirmButtonColor: theme.palette.success.main,
        cancelButtonText: "Ignore",
        cancelButtonColor: theme.palette.error.main,
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.localStorage.setItem("starred_lists", "[]");
          location.reload();
        }
      });
    }
  }

  handleStarReset(evt) {
    let { metadata } = this.state;

    Swal.fire({
      title: "Warning!",
      text: "Are you sure you want to delete this starred list?",
      icon: "warning",
      confirmButtonText: "Delete",
      confirmButtonColor: theme.palette.success.main,
      cancelButtonText: "No",
      cancelButtonColor: theme.palette.error.main,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        let starred_lists = JSON.parse(
          window.localStorage.getItem("starred_lists") || "[]"
        );
        if (starred_lists.length == 1) {
          starred_lists.shift();
          metadata.shift();
        } else {
          starred_lists.splice(evt, 1);
          metadata.splice(evt, 1);
        }
        window.localStorage.setItem(
          "starred_lists",
          JSON.stringify(starred_lists)
        );
        this.setState({ metadata: metadata });
      }
    });
  }

  handleStarImport(evt) {
    if (evt.target.files.length) {
      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (evtR) => {
        let starred_lists = JSON.parse(
          window.localStorage.getItem("starred_lists") || "[]"
        );
        let starred_list = JSON.parse(evtR.target.result);
        let i = parseInt(evt.target.id.replace("file-input-", ""));
        starred_lists[i].children = starred_list.children;
        window.localStorage.setItem(
          "starred_lists",
          JSON.stringify(starred_lists)
        );
        let { metadata } = this.state;
        if (metadata.length && metadata[i].type == "Starred") {
          metadata[i].children = starred_list.children;
          this.setState({
            metadata: metadata,
          });
        }
      };
      reader.readAsText(file);
    }
  }

  handleStarExport(evt) {
    let starred_lists = JSON.parse(
      window.localStorage.getItem("starred_lists") || "[]"
    );
    let starred_list = starred_lists[evt];

    const file = new Blob([JSON.stringify(starred_list)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(file);
    link.download = `libdrive-starred-${starred_list.name}-${+new Date()}.json`;
    link.click();
  }

  handlePin(evt, pin) {
    let starred_lists = JSON.parse(
      window.localStorage.getItem("starred_lists") || "[]"
    );
    if (!pin) {
      starred_lists[evt].categoryInfo.pinned = false;
      window.localStorage.setItem(
        "starred_lists",
        JSON.stringify(starred_lists)
      );
      this.setState({ metadata: starred_lists });
    } else {
      starred_lists[evt].categoryInfo.pinned = true;
      window.localStorage.setItem(
        "starred_lists",
        JSON.stringify(starred_lists)
      );
      this.setState({ metadata: starred_lists });
    }
  }

  render() {
    let { hide, metadata, server, star } = this.state;

    return star ? (
      <div className="Carousel" style={{ paddingTop: "3%" }}>
        {metadata.length
          ? metadata.map((category, p) =>
              category.children.length || !hide ? (
                <div
                  className="carousel__category"
                  style={{ margin: "0 auto 0 auto" }}
                  key={guid()}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          float: "left",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Link
                          to={"#"}
                          className="carousel__category__title no_decoration_link"
                        >
                          {category.categoryInfo.name}
                        </Link>
                        <Tooltip title="Delete" placement="top">
                          <IconButton
                            color="primary"
                            onClick={() => this.handleStarReset(p)}
                            style={{ marginLeft: "10px" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                      <div
                        style={{
                          float: "right",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          id={`file-input-${p}`}
                          hidden
                          onChange={this.handleStarImport}
                          type="file"
                        />
                        <label htmlFor={`file-input-${p}`}>
                          <Tooltip title="Upload" placement="top">
                            <IconButton color="primary">
                              <CloudUploadIcon />
                            </IconButton>
                          </Tooltip>
                        </label>
                        <Tooltip title="Export" placement="top">
                          <IconButton
                            color="primary"
                            onClick={() => this.handleStarExport(p)}
                          >
                            <CloudDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        {category.categoryInfo.pinned ? (
                          <Tooltip title="Unpin" placement="top">
                            <IconButton
                              color="primary"
                              onClick={() => this.handlePin(p, false)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                enableBackground="new 0 0 24 24"
                                height="24px"
                                viewBox="0 0 24 24"
                                width="24px"
                                fill={theme.palette.primary.main}
                              >
                                <g>
                                  <rect fill="none" height="24" width="24" />
                                </g>
                                <g>
                                  <path
                                    d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z"
                                    fillRule="evenodd"
                                  />
                                </g>
                              </svg>
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Pin" placement="top">
                            <IconButton
                              color="primary"
                              onClick={() => this.handlePin(p, true)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                enableBackground="new 0 0 24 24"
                                height="24px"
                                viewBox="0 0 24 24"
                                width="24px"
                                fill={theme.palette.primary.main}
                              >
                                <g>
                                  <rect fill="none" height="24" width="24" />
                                </g>
                                <g>
                                  <path d="M14,4v5c0,1.12,0.37,2.16,1,3H9c0.65-0.86,1-1.9,1-3V4H14 M17,2H7C6.45,2,6,2.45,6,3c0,0.55,0.45,1,1,1c0,0,0,0,0,0l1,0v5 c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19v-2c0,0,0,0,0,0c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1 C18,2.45,17.55,2,17,2L17,2z" />
                                </g>
                              </svg>
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="carousel__items">
                    {category.children.length
                      ? category.children.map((item) => (
                          <div>
                            <figure
                              className="carousel__item__figure"
                              key={guid()}
                            >
                              <Link to={`/view/${item.id}`} key={guid()}>
                                <img
                                  src={
                                    item.posterPath ||
                                    `${server}/api/v1/image/poster?text=${item.title}&extention=jpeg`
                                  }
                                  key={guid()}
                                  className="carousel__item__poster"
                                  alt={item.title}
                                />
                              </Link>
                              <Typography className="carousel__item__title">
                                {item.title}
                              </Typography>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <IconButton
                                  style={{ padding: "2px" }}
                                  onClick={() =>
                                    this.handleStar(item, category)
                                  }
                                >
                                  <StarIcon />
                                </IconButton>
                              </div>
                            </figure>
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ) : null
            )
          : null}
      </div>
    ) : (
      <div className="Carousel">
        {metadata.length
          ? metadata.map((category) =>
              category.children.length || !hide ? (
                <div className="carousel__category" key={guid()}>
                  <Link
                    to={
                      category.categoryInfo.type == "Starred"
                        ? "#"
                        : `/browse/${category.categoryInfo.name}`
                    }
                    key={guid()}
                    className="carousel__category__title no_decoration_link"
                  >
                    {category.categoryInfo.name}
                  </Link>
                  <div className="carousel__items">
                    {category.children.length
                      ? category.children.map((item) => (
                          <figure
                            className="carousel__item__figure"
                            key={guid()}
                          >
                            <Link to={`/view/${item.id}`} key={guid()}>
                              <img
                                src={
                                  item.posterPath ||
                                  `${server}/api/v1/image/poster?text=${item.title}&extention=jpeg`
                                }
                                key={guid()}
                                className="carousel__item__poster"
                                alt={item.title}
                              />
                            </Link>
                            <Typography
                              className="carousel__item__title"
                              key={guid()}
                            >
                              {item.title}
                            </Typography>
                          </figure>
                        ))
                      : null}
                  </div>
                </div>
              ) : null
            )
          : null}
      </div>
    );
  }
}
