import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile, deleteAccount } from '../../actions/profileActions';
import Spinner from '../common/spinner';
import { Link } from 'react-router-dom';
import  ProfileActions from './ProfileActions';
import Experience from './Experience';
import Education from './Education';


class Dashboard extends Component {
  componentDidMount () {
    this.props.getCurrentProfile();
  }
   
   onDeleteClick(e) {
     this.props.deleteAccount();
   }
  render() {

    const { user } = this.props.auth;
    const { profile, loading } = this.props.profile;

    let dashboardContent;

    if(profile === null || loading){
      dashboardContent = <div className="col-md-3"> <Spinner /> </div> 
    } else {
      //check if logged in user has profile data
      if(Object.keys(profile).length > 0) {
        dashboardContent = (
          <div>
            <p className="lead text-muted">Welcom <Link to={`/profile/${profile.handle}`}>{user.name}</Link></p>  
              <ProfileActions />
              <Experience experience={profile.experience}/>
              <ProfileActions />
              <Education education={profile.education} />
              <div style={{marginMottom: '60px'}}>
               <button onClick={this.onDeleteClick.bind(this)}  className ="btn btn-danger"
               >Delete My Account</button>
              </div>
          </div>
        );
      } else {
        //user logged in but have no profile
        dashboardContent= (
          <div>
            <p className="lead text-muted">Welcom {user.name} </p>
            <p>You have not yet setup a profile, please add some info</p>
            <Link to="/create-profile"  className="btn btn-lg btn-info">
            Create Profile
            </Link>
          </div>
        )
      }
    }
    

    return (
      <div className="dashboard">
      <div className="container">
        <div className="row">
           <div className="col-md-12">
              <h1 className="display-4">
                Dashboard  
              </h1>
        
              {dashboardContent}
           </div>
        </div>
      </div>
    </div>
    
    )
  }
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
}

 const mapStateToProps = state => {
   return {
     profile: state.profile,
     auth: state.auth
   }
 }

export default connect(mapStateToProps, {getCurrentProfile, deleteAccount})(Dashboard);