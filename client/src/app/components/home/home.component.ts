import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  regForm: FormGroup;
  avatar: any = '';
  name: any = '';
  userId: any = '';
  posts: any[] = [];
  showCommentInput: boolean = false;
  content: string = '';
  comments: any[] = [];
  likes: any[] = [];
  followersData: any[] = [];

  constructor(private http: HttpClient, private route: Router) {
    this.regForm = new FormGroup({
      content: new FormControl(null, Validators.required),
      mediaUrl: new FormControl(null, Validators.required)
    })




    const token = localStorage.getItem("token")
    if (!token) {
      this.route.navigate(['/login'])
    }

    this.http.get<any[]>('http://localhost:5100/comments').subscribe((res) => {
      this.comments = res
    })

    this.http.get<any[]>('http://localhost:5100/likes').subscribe((res) => {
      this.likes = res
    })

    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res
    })



    const avatar = localStorage.getItem('userAvatar')
    this.avatar = avatar
    const name = localStorage.getItem('userName')
    this.name = name
    const userId = localStorage.getItem("userId")
    this.userId = userId
    console.log(userId)

    this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
      this.posts = res;
    });


  }

  onSubmit(details = { mediaUrl: String, content: String }): void {
    const post = {
      userId: this.userId,
      mediaUrl: details.mediaUrl,
      content: details.content,
      mediaType: 'Image',
    }
    this.http.post('http://localhost:5100/posts', post)
      .subscribe(
        response => {
          alert("Post Successfully Posted!")
          console.log('Post successful:', response);
          this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
            this.posts = res;
          });
        },
        error => {
          alert("Post Failed!")
          console.error('Error posting:', error);
        }
      );
  }





  dislikePost(post: any): void {
    post.isLiked = !post.isLiked;
    const dislikeData = {
      postId: post._id,
    };

    this.http.post(`http://localhost:5100/dislike/${dislikeData.postId}`, dislikeData)
      .subscribe(
        (res: any) => {
          alert("dislike")
        },
        (error) => {
          console.error(error);
        }
      );
  }


  likePost(postId: string): void {
    // postId.isLiked = !postId.isLiked;

    this.http.put(`http://localhost:5100/posts/${postId}/likes`, {})
      .subscribe(
        (res: any) => {
          alert("Liked");
          this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
            this.posts = res;
          });
        },
        (error) => {
          console.error(error);
          alert("Failed");
        }
      );
  }


  followUser(post: any) {
    const postDetails = {
      userId: this.userId,
      followingId: post.userId._id
    }
    this.http.post(`http://localhost:5100/follow`, postDetails).subscribe((res) => {
      console.log(res)
      alert(`You Followed ${post.userId.username}`)
    })

    this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
            this.posts = res;
          });

    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res
    })
  }

  unfollowUser(post: any): void {
    const data = {
      followingId: post.userId._id
    };

    this.http.delete<any>('http://localhost:5100/follow', { body: data })
      .subscribe(
        response => {
          alert(`You unfollowed ${post.userId.username}`);
          this.refreshFollowersData();
          this.http.put(`http://localhost:5100/user/${this.userId}/follow`, this.userId).subscribe((res) => {
          })

          this.http.get<any[]>(`http://localhost:5100/posts/${this.userId}`).subscribe((res) => {
            this.posts = res;
          });
        },
        error => {
          console.error(error);
        }
      );
  }

  refreshFollowersData(): void {
    this.http.get<any[]>('http://localhost:5100/follow').subscribe((res) => {
      this.followersData = res;
    });
  }


  sendComment(postId: string, commentInput: string) {
    this.http.post('http://localhost:5100/comments', { userId: this.userId, postId, content: commentInput }).subscribe(
      (response) => {
        this.http.get<any[]>('http://localhost:5100/comments').subscribe((res) => {
          this.comments = res
        })
      },
      (error) => {
        console.error('Failed to post comment:', error);
      }
    );
  }


  uploadStory(fileInput: HTMLInputElement): void {
    const file: File | undefined = fileInput.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.http.post('http://localhost:5100/api/stories/upload', formData)
        .subscribe(() => {
          // Handle success
        }, (error) => {
          console.error('Upload error:', error);
        });
    } else {
      console.error('No file selected');
    }
  }

  
  

}