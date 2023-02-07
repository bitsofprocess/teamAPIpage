let BASE_URL = "https://dmp3yci3ik.execute-api.us-east-1.amazonaws.com/apptest"
    let request_log
    let response_log
    let team_response_log

    const set_stage = async () => {
      BASE_URL = document.getElementById("stage-select").value;
      console.log('BASE_URL: ', BASE_URL);
    }

    const on_load = () => {
      request_log = document.getElementById("request-log")
      response_log = document.getElementById("response-log")
      team_response_log = document.getElementById("team-response-log")
    }

    const toggle_loader = (flag) => {
      if (flag) {
        document.getElementById("loader").style.display = "block"
      } else {
        document.getElementById("loader").style.display = "none"
      }
    }

    function write_request({ url, method, body }) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML = `${Date().toString()}
URL: ${url}
Method: ${method}
Body: ${JSON.stringify(body)}
      `
      if (request_log.hasChildNodes()) {
        request_log.insertBefore(pre, request_log.childNodes[0])
      } else {
        request_log.appendChild(pre)
      }
    }

    function write_response(message) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML = Date().toString() + "\n" + message
      if (response_log.hasChildNodes()) {
        response_log.insertBefore(pre, response_log.childNodes[0])
      } else {
        response_log.appendChild(pre)
      }
    }

    function write_team(message) {
      var pre = document.createElement("p")
      pre.style.wordWrap = "break-word"
      pre.innerHTML =
        Date().toString() + "\n" + JSON.stringify(message, null, 4)
      if (team_response_log.hasChildNodes()) {
        team_response_log.removeChild(team_response_log.childNodes[0])
      }
      team_response_log.appendChild(pre)
    }

    const call_api = async ({ url, method, body }) => {
      write_request({ url, method, body })
      toggle_loader(true)
      try {
        const response = await fetch(url, {
          method,
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()
        write_response(JSON.stringify(data))
        toggle_loader(false)
        return data
      } catch (error) {
        write_response(JSON.stringify(error))
        toggle_loader(false)
      }
    }

    const genereate_new_promocode = async () => {
      await call_api({
        url: `${BASE_URL}/generateNewPromoCode`,
        method: "POST",
        body: {
          firstName: document.getElementById("firstName").value,
          lastName: document.getElementById("lastName").value,
          email: document.getElementById("email").value,
          businessName: document.getElementById("businessName").value,
          userId: document.getElementById("userId").value,
        },
      })
    }

    const get_user_attributes = async () => {
      const id = document.getElementById("id").value
      await call_api({
        url: `${BASE_URL}/getCognitoUserAttributes/${id}`,
        method: "GET"
      })
    }

    const add_user_to_team = async () => {
      const user_id = document.getElementById("add-to-team-user-id").value
      const promocode = document.getElementById("add-to-team-promocode").value
      await call_api({
        url: `${BASE_URL}/checkPromoCode/?userId=${user_id}&promocode=${promocode}`,
        method: "GET",
      })
    }

    const remove_from_team = async () => {
      const userId = document.getElementById("remove-from-team-user-id").value
      const promoCode = document.getElementById(
        "remove-from-team-promocode"
      ).value
      await call_api({
        url: `${BASE_URL}/removePlayerFromPromoCode`,
        method: "POST",
        body: { promoCode, userId },
      })
    }

    const change_team = async () => {
      await call_api({
        url: `${BASE_URL}/changeTeam`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { from, to, userId },
      })
    }

    const get_team_link = async () => {
      const teamCode = document.getElementById("get-team-link-teamCode").value
      const userName = document.getElementById("get-team-link-userName").value
      await call_api({
        url: `${BASE_URL}/getTeamLink/?team_code=${teamCode}&user_name=${userName}`,
        method: "GET",
      })
    }

    const get_team = async () => {
      toggle_loader(true)
      const teamCode = document.getElementById("get-team-teamCode").value
      const team = await call_api({
        url: `${BASE_URL}/getTeam/${teamCode}`,
        method: "GET",
      })
      write_team(team)
    }

    window.addEventListener("load", on_load, false)