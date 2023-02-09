import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  baseURL
  auth_token

constructor() {
    this.baseURL = environment.backend.baseURL;
    this.auth_token = "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJFeHBsb3JhIFByb2Nlc3MiLCJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsImlhdCI6MTY3NTI2MTQzMiwiZXhwIjoxNjc1MzQ3ODMyLCJVU0VSIjoxfQ.ieaYwf3Qg5AoIhp6TE3i4i_AR8J-Rotxl10LYiP8SQi--Jqc6P5OlrcWsAWdhHfUKlGN_QzyXI3X_WcM89aFrQ"
  }

}